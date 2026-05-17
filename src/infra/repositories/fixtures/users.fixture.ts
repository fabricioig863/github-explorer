import type { RecentCommit } from '@/domain/entities/RecentCommit';
import type { UserProfile } from '@/domain/entities/UserProfile';

export const USER_PROFILE_FIXTURE: UserProfile = {
  id: 1,
  login: 'octocat',
  name: 'Octo Cat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  bio: 'Curioso por ferramentas para devs. Construindo experiências mobile com React Native.',
  location: 'São Paulo, BR',
  website: 'https://github.com/octocat',
  followers: 1248,
  following: 87,
  publicRepos: 42,
};

export const RECENT_COMMITS_FIXTURE: RecentCommit[] = [
  {
    sha: 'a1b2c3d',
    message: 'feat(profile): grade de contribuições com seed determinístico',
    repo: 'octolens',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    sha: 'e4f5a6b',
    message: 'fix(toggle): suavizar curva do thumb no spring',
    repo: 'octolens',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    sha: '7c8d9e0',
    message: 'refactor(hooks): extrair useProfileData para camada presentation',
    repo: 'octolens',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    sha: 'b1c2d3e',
    message: 'chore(deps): bump expo SDK para 54.0.33',
    repo: 'octolens',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
];
