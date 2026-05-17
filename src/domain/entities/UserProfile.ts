export interface UserProfile {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  followers: number;
  following: number;
  publicRepos: number;
}
