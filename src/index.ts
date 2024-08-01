import { PrismaClient } from '@prisma/client';
import { initialize } from './initialize';

export const prisma = new PrismaClient();

async function main() {
  initialize();

  await showRepository();

  console.log('以下のコマンドが使用可能です。');
  console.log();
  console.log('npm run start:register <owner/repository>');
  console.log('\tリポジトリを集計対象に加える');
}

main().finally(async () => {
  await prisma.$disconnect();
});

async function showRepository() {
  const repositories = await prisma.repository.findMany();

  if (repositories.length === 0) {
    console.log('repositoryが登録されていません');
  } else {
    console.log('現在登録されているrepository');
    repositories.forEach((repo) => {
      console.log(`\t${repo.fullName}`);
    });
    console.log();
  }
}
