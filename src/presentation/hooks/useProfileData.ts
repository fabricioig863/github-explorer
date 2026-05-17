import { useQuery } from '@tanstack/react-query';

import type { UserProfile } from '@/domain/entities/UserProfile';
import { container } from 'src/infra/di/container';

const FIVE_MINUTES = 5 * 60 * 1000;

export function useProfileData(username: string) {
  return useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn: () => container.getUserProfileUseCase.execute({ username }),
    staleTime: FIVE_MINUTES,
    enabled: username.trim().length > 0,
  });
}
