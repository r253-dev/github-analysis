import { PrismaClient } from '@prisma/client';
import { initialize } from './initialize';
import { fetchAllNewPulls } from './repositories/github';
import { createPulls, findMaxNumberByRepository } from './repositories/db';

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
