import PrismaClient from '@prisma/client';
import { prisma } from '../fetch';
import { Pull } from './github';

export async function findMaxNumberByRepository(repository: PrismaClient.Repository) {
  const model = await prisma.pull.findFirst({
    select: { number: true },
    where: {
      repo: {
        id: repository.id,
      },
    },
    orderBy: { number: 'desc' },
  });
  if (model === null) {
    return null;
  }
  return model.number;
}

export async function createPulls(repository: PrismaClient.Repository, pulls: Pull[]) {
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
