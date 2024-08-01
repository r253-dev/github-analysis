import { PrismaClient } from '@prisma/client';
import { initialize } from './initialize';
import { fetchRepository } from './repositories/github';

export const prisma = new PrismaClient();

async function main() {
  initialize();

  const argv = process.argv;
  if (argv.length <= 2) {
    throw new Error('owner/repository を指定してください\nnpm run start <owner/repository>');
  }

  const repositoryNames = argv.slice(2);
  repositoryNames.forEach(validateRepositoryName);

  const alreadyRegisteredRepositories = [];
  const registeredRepositories = [];

  for (const repositoryName of repositoryNames) {
    {
      const repository = await prisma.repository.findUnique({
        where: { fullName: repositoryName },
      });
      if (repository !== null) {
        alreadyRegisteredRepositories.push(repositoryName);
        continue;
      }
    }
    const repository = await fetchRepository(repositoryName);
    await prisma.repository.create({
      data: {
        id: repository.id,
        nodeId: repository.nodeId,
        name: repository.name,
        fullName: repository.fullName,
        ownerLogin: repository.owner.login,
        description: repository.description,
        visibility: repository.visibility,
      },
    });
    registeredRepositories.push(repositoryName);
  }
  console.log(
    `登録が完了しました。\n新たに登録されたリポジトリー : ${registeredRepositories.join(',')}${alreadyRegisteredRepositories.length > 0 ? `\n既に登録されていたリポジトリー: ${alreadyRegisteredRepositories.join(',')}` : ''}`,
  );
}

function validateRepositoryName(name: string) {
  if (name.split('/').length !== 2) {
    throw new Error(`repository名が正しくありません。 ${name}`);
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
