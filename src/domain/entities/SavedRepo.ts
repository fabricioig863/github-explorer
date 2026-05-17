export interface SavedRepo {
  id: number;
  fullName: string;
  name: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  language: string | null;
  htmlUrl: string;
  savedAt: Date;
}
