import axios from 'axios';

const GH_TOKEN = process.env.GH_TOKEN;

type State = 'closed' | 'open';
type User = {
  login: string;
};
type Label = {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPullResponse(pull: any) {
  return {
    number: pull.number as number,
    state: pull.status as State,
    title: pull.title as string,
    user: {
      login: pull.user.login as string,
    },
    body: pull.body as string,
    created_at: new Date(pull.created_at),
    updated_at: new Date(pull.updated_at),
    closed_at: new Date(pull.closed_at),
    merged_at: new Date(pull.merged_at),
    assignees: pull.assignees.map((assignee: User) => ({
      login: assignee.login as string,
    })),
    labels: pull.labels as Label[],
    draft: pull.draft as boolean,
    head: {
      ref: pull.head.ref as string,
      repo: {
        name: pull.head.repo.name as string,
        fullName: pull.head.repo.full_name as string,
        owner: {
          login: pull.head.repo.owner.login as string,
        },
      },
    },
    base: {
      ref: pull.base.ref as string,
      repo: {
        name: pull.base.repo.name as string,
        fullName: pull.base.repo.full_name as string,
        owner: {
          login: pull.base.repo.owner.login as string,
        },
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRepositoryResponse(repository: any) {
  return {
    id: repository.id as number,
    nodeId: repository.node_id as string,
    name: repository.name as string,
    fullName: repository.full_name as string,
    description: repository.description as string | null,
    owner: {
      login: repository.owner.login as string,
    },
    visibility: repository.visibility as string,
    private: repository.private as boolean,
    htmlUrl: repository.html_url as string,
  };
}

export async function fetchAllPulls(repo: string) {
  const pulls = [];
  for (let page = 1; ; page++) {
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/pulls?state=all&per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    if (response.data.length === 0) {
      break;
    }
    pulls.push(...response.data);
  }
  return pulls.map(toPullResponse);
}

export async function fetchRepository(repo: string) {
  const response = await axios.get(`https://api.github.com/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  return toRepositoryResponse(response.data);
}
