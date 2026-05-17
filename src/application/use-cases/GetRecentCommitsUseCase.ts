import type { RecentCommit } from '@/domain/entities/RecentCommit';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';

export interface GetRecentCommitsInput {
  username: string;
  limit: number;
}

export class GetRecentCommitsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetRecentCommitsInput): Promise<RecentCommit[]> {
    const username = input.username.trim();
    if (!username) {
      throw new InvalidQueryError('Username é obrigatório.');
    }
    return this.userRepository.getRecentCommits(username, input.limit);
  }
}
