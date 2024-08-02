import { PrismaClient } from '@prisma/client';
import { initialize } from './initialize';
import {
  fetchAllNewPulls,
  fetchCommitsByPull,
  fetchEventsByPulls,
  fetchPullDetail,
  fetchRateLimit,
} from './repositories/github';
import {
  createCommits,
  createPulls,
  findAllOpenPullsByRepository,
  findMaxNumberByRepository,
  removeCommitsByPulls,
  findAllPullsWhereCommitsIsEmptyByRepository,
  findAllIncompletePullsByRepository,
  upsertPullDetail,
  removePullDetailsByPulls,
  findAllPullsWhereOpenedAtIsEmpty,
  updatePullOpenedAt,
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
      await removePullDetailsByPulls(pulls);
    }
    // PR詳細の取得
    {
      const rateLimit = await fetchRateLimit();
      const limit = Math.floor(rateLimit.rate.remaining / 2);
      const pulls = await findAllIncompletePullsByRepository(repository, {
        limit,
      });
      for (const pull of pulls) {
        const pullDetail = await fetchPullDetail(pull);
        await upsertPullDetail(pull, pullDetail);
      }
    }
    // コミットの取得
    {
      const rateLimit = await fetchRateLimit();
      const limit = Math.floor(rateLimit.rate.remaining / 2);
      const pulls = await findAllPullsWhereCommitsIsEmptyByRepository(repository, {
        limit,
      });
      for (const pull of pulls) {
        const commits = await fetchCommitsByPull(pull);
        await createCommits(pull, commits);
      }
    }
    // PRイベントの取得
    {
      const rateLimit = await fetchRateLimit();
      const limit = Math.floor(rateLimit.rate.remaining / 2);
      const pulls = await findAllPullsWhereOpenedAtIsEmpty(repository, { limit });
      for (const pull of pulls) {
        const events = await fetchEventsByPulls(pull);
        const openedAt =
          events.filter((row) => row.event === 'ready_for_review')?.slice(-1)[0]?.createdAt ||
          pull.createdAt;
        await updatePullOpenedAt(pull, openedAt);
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
