import { screen } from '@testing-library/react-native';

import { Skeleton } from '@/presentation/design-system/Skeleton';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('Skeleton', () => {
  it('renders an accessible progressbar with default label', () => {
    renderWithProviders(<Skeleton />, { withNavigation: false });
    expect(screen.getByLabelText('Carregando')).toBeTruthy();
  });

  it('accepts custom width, height and radius without crashing', () => {
    const { toJSON } = renderWithProviders(
      <Skeleton width={120} height={32} radius={12} />,
      { withNavigation: false },
    );
    expect(toJSON()).toBeTruthy();
  });
});
