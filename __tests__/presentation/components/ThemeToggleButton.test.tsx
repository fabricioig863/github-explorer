import { fireEvent } from '@testing-library/react-native';

import { ThemeToggleButton } from '@/presentation/components/ThemeToggleButton';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('ThemeToggleButton', () => {
  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    const { root } = renderWithProviders(
      <ThemeToggleButton isDark={false} onToggle={onToggle} />,
      { withNavigation: false },
    );

    fireEvent.press(root);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders without crashing in both isDark states', () => {
    const { rerender } = renderWithProviders(
      <ThemeToggleButton isDark={false} onToggle={jest.fn()} />,
      { withNavigation: false },
    );
    rerender(<ThemeToggleButton isDark onToggle={jest.fn()} />);
  });
});
