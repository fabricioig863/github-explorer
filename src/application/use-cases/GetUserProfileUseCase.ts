import type { UserProfile } from '@/domain/entities/UserProfile';
import { InvalidQueryError } from '@/domain/errors/InvalidQueryError';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';

export interface GetUserProfileInput {
  username: string;
}

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserProfileInput): Promise<UserProfile> {
    const username = input.username.trim();
    if (!username) {
      throw new InvalidQueryError('Username é obrigatório.');
    }
    return this.userRepository.getProfile(username);
  }
}
