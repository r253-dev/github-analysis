import PrismaClient from '@prisma/client';
import { prisma } from '../fetch';
import { Commit, Pull } from './github';

const DEFAULT_LIMIT = 500;

export async function findAllOpenPullsByRepository(repository: PrismaClient.Repository) {
  const models = await prisma.pull.findMany({
    where: {
      state: 'open',
      repo: {
        id: repository.id,
      },
    },
  });
  return models;
}

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

export async function findAllPullsWhereCommitsIsEmptyByRepository(
  repository: PrismaClient.Repository,
  options: { limit: number },
) {
  const pulls = await prisma.pull.findMany({
    where: {
      repositoryId: repository.id,
      commits: {
        none: {},
      },
    },
    include: {
      repo: true,
    },
    orderBy: {
      number: 'asc',
    },
    take: options.limit || DEFAULT_LIMIT,
  });
  return pulls;
}

export async function createCommits(pull: PrismaClient.Pull, commits: Commit[]) {
  await prisma.commit.createMany({
    data: commits.map((commit) => ({
      nodeId: commit.nodeId,
      sha: commit.sha,
      message: commit.commit.message,
      authorName: commit.commit.authorName,
      date: commit.commit.date,
      pullId: pull.id,
    })),
  });
}

export async function removeCommitsByPulls(pulls: PrismaClient.Pull[]) {
  await prisma.commit.deleteMany({
    where: {
      pullId: {
        in: pulls.map((pull) => pull.id),
      },
    },
  });
}
