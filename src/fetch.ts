import { PrismaClient } from '@prisma/client';
import { initialize } from './initialize';
import { fetchAllNewPulls, fetchCommitsByPull, fetchRateLimit } from './repositories/github';
import {
  createCommits,
  createPulls,
  findAllOpenPullsByRepository,
  findMaxNumberByRepository,
  removeCommitsByPulls,
  findAllPullsWhereCommitsIsEmptyByRepository,
} from './repositories/db';

export const prisma = new PrismaClient();

async function main() {
  initialize();

  const repositories = await prisma.repository.findMany();
  if (repositories.length === 0) {
    throw new Error('repositoryが登録されていません');
  }

  for (const repository of repositories) {
    // 新しいPRの取得
    {
      const result = await findMaxNumberByRepository(repository);
      const pulls = await fetchAllNewPulls(repository.fullName, result);
      await createPulls(repository, pulls);
    }
    // 前回の取得から変更がありそうなPRのキャッシュを削除（オープンのPR）
    {
      const pulls = await findAllOpenPullsByRepository(repository);
      await removeCommitsByPulls(pulls);
    }
    // コミットの取得
    {
      const rateLimit = await fetchRateLimit();
      const limit = Math.floor(rateLimit.rate.remaining / 2);
      console.log(`limit: ${limit}, remaining: ${rateLimit.rate.remaining}`);
      const pulls = await findAllPullsWhereCommitsIsEmptyByRepository(repository, {
        limit,
      });
      for (const pull of pulls) {
        const commits = await fetchCommitsByPull(pull);
        await createCommits(pull, commits);
      }
    }
  }
}

main()
  .catch(async (e: Error) => {
    console.error(e.message);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
