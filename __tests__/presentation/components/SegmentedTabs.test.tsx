import { fireEvent, screen } from '@testing-library/react-native';

import { SegmentedTabs, type SegmentedTab } from '@/presentation/components/SegmentedTabs';

import { renderWithProviders } from '../../test-utils/renderWithProviders';

const TABS: readonly SegmentedTab<'a' | 'b' | 'c'>[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

describe('SegmentedTabs', () => {
  it('renders every tab label', () => {
    renderWithProviders(<SegmentedTabs tabs={TABS} selected="a" onChange={jest.fn()} />, {
      withNavigation: false,
    });

    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
    expect(screen.getByText('Gamma')).toBeTruthy();
  });

  it('marks the selected tab via accessibilityState', () => {
    renderWithProviders(<SegmentedTabs tabs={TABS} selected="b" onChange={jest.fn()} />, {
      withNavigation: false,
    });

    const beta = screen.getByLabelText('Beta');
    expect(beta.props.accessibilityState?.selected).toBe(true);
    const alpha = screen.getByLabelText('Alpha');
    expect(alpha.props.accessibilityState?.selected).toBe(false);
  });

  it('emits the new id when a tab is pressed', () => {
    const onChange = jest.fn();
    renderWithProviders(<SegmentedTabs tabs={TABS} selected="a" onChange={onChange} />, {
      withNavigation: false,
    });

    fireEvent.press(screen.getByLabelText('Gamma'));
    expect(onChange).toHaveBeenCalledWith('c');
  });
});
