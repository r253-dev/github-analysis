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

type RateLimitItem = {
  limit: number;
  used: number;
  remaining: number;
  reset: number;
};
type RateLimit = {
  resources: {
    core: RateLimitItem;
  };
  rate: RateLimitItem;
};

export type Pull = {
  id: number;
  number: number;
  state: State;
  title: string;
  user: {
    login: string;
  };
  body: string;
  created_at: Date;
  updated_at: Date;
  closed_at: Date;
  merged_at: Date;
  assignees: {
    login: string;
  }[];
  labels: Label[];
  draft: boolean;
  head: {
    ref: string;
    repo: {
      name: string;
      fullName: string;
      owner: {
        login: string;
      };
    };
  };
  base: {
    ref: string;
    repo: {
      name: string;
      fullName: string;
      owner: {
        login: string;
      };
    };
  };
};

function toPullResponse(pull: any): Pull {
  return {
    id: pull.id,
    number: pull.number,
    state: pull.state,
    title: pull.title,
    user: {
      login: pull.user.login,
    },
    body: pull.body,
    created_at: new Date(pull.created_at),
    updated_at: new Date(pull.updated_at),
    closed_at: new Date(pull.closed_at),
    merged_at: new Date(pull.merged_at),
    assignees: pull.assignees.map((assignee: User) => ({
      login: assignee.login,
    })),
    labels: pull.labels,
    draft: pull.draft,
    head: {
      ref: pull.head.ref,
      repo: {
        name: pull.head.repo.name,
        fullName: pull.head.repo.full_name,
        owner: {
          login: pull.head.repo.owner.login,
        },
      },
    },
    base: {
      ref: pull.base.ref,
      repo: {
        name: pull.base.repo.name,
        fullName: pull.base.repo.full_name,
        owner: {
          login: pull.base.repo.owner.login,
        },
      },
    },
  };
}

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

/**
 * minNumberに指定したPRよりも大きいPR番号のPRを取得する
 * @param repositoryFullName リポジトリ名
 * @param minNumber PR番号の最小値。ここで指定した最小値を超えるPRのみを取得する
 * @returns PR
 */
export async function fetchAllNewPulls(repositoryFullName: string, minNumber: number | null) {
  const rateLimit = await fetchRateLimit();

  const pulls = [];
  for (let page = 1; page < rateLimit.rate.remaining; page++) {
    console.log(`${repositoryFullName} page: ${page}`);
    const response = (
      await axios.get(
        `https://api.github.com/repos/${repositoryFullName}/pulls?state=all&per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${GH_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      )
    ).data.filter((row: any) => minNumber === null || row.number > minNumber);

    if (response.length === 0) {
      break;
    }

    pulls.push(...response);
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

export async function fetchRateLimit(): Promise<RateLimit> {
  const response = await axios.get(`https://api.github.com/rate_limit`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  console.log({ remaining: response.data.rate.remaining, reset: response.data.rate.reset });
  return response.data;
}
