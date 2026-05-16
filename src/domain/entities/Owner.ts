export interface Owner {
  id: number;
  login: string;
  avatarUrl: string;
  type: 'User' | 'Organization';
}
