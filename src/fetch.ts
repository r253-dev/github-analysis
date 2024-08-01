import { PrismaClient } from '@prisma/client';
import { initialize } from './initialize';
import { fetchAllNewPulls } from './repositories/github';

export const prisma = new PrismaClient();

async function main() {
  initialize();

  const repositories = await prisma.repository.findMany();
  if (repositories.length === 0) {
    throw new Error('repositoryが登録されていません');
  }

  for (const repository of repositories) {
    const result = await prisma.pull.findFirst({
      select: { number: true },
      where: { repo: { fullName: repository.fullName } },
      orderBy: { number: 'desc' },
    });

    const pulls = await fetchAllNewPulls(repository.fullName, result && result.number);

    await prisma.pull.createMany({
      data: pulls.map((pull) => ({
        id: pull.id,
        number: pull.number,
        state: pull.state,
        title: pull.title,
        userLogin: pull.user.login,
        createdAt: new Date(pull.created_at),
        updatedAt: new Date(pull.updated_at),
        closedAt: pull.closed_at ? new Date(pull.closed_at) : null,
        mergedAt: pull.merged_at ? new Date(pull.merged_at) : null,
        assignees: pull.assignees.join(','),
        draft: pull.draft,
        headRef: pull.head.ref,
        baseRef: pull.base.ref,
        repositoryId: repository.id,
      })),
    });
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
