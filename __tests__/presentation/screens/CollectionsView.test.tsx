import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { SavedRepo } from '@/domain/entities/SavedRepo';
import { CollectionsView } from '@/presentation/screens/SavedScreen/components/CollectionsView';
import type { CollectionId } from '@/presentation/utils/savedCollections';

import { makeSavedRepo } from '../../test-utils/fixtures/savedRepo.fixture';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

const ZERO_COUNTS: Record<CollectionId, number> = {
  mobile: 0,
  backend: 0,
  tools: 0,
  'ai-ml': 0,
};

function renderRow({ item }: { item: SavedRepo }) {
  return <Text>{item.name}</Text>;
}

function makeProps(overrides?: Partial<React.ComponentProps<typeof CollectionsView>>) {
  return {
    counts: ZERO_COUNTS,
    totalCount: 0,
    savedRepos: [] as readonly SavedRepo[],
    activeCollection: null,
    onSelectCollection: jest.fn(),
    renderRow,
    ...overrides,
  };
}

describe('CollectionsView', () => {
  it('renders the four collection cards with counts from props', () => {
    const props = makeProps({ counts: { mobile: 3, backend: 2, tools: 1, 'ai-ml': 4 } });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    expect(screen.getByText('Mobile')).toBeTruthy();
    expect(screen.getByText('Backend')).toBeTruthy();
    expect(screen.getByText('Ferramentas')).toBeTruthy();
    expect(screen.getByText('AI & ML')).toBeTruthy();
    expect(screen.getByLabelText('Coleção Mobile, 3 repositórios')).toBeTruthy();
    expect(screen.getByLabelText('Coleção AI & ML, 4 repositórios')).toBeTruthy();
  });

  it('selects a collection from the first row when its card is pressed', () => {
    const onSelectCollection = jest.fn();
    const props = makeProps({ onSelectCollection });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    fireEvent.press(screen.getByLabelText('Coleção Mobile, 0 repositórios'));
    expect(onSelectCollection).toHaveBeenCalledWith('mobile');
  });

  it('selects a collection from the second row when its card is pressed', () => {
    const onSelectCollection = jest.fn();
    const props = makeProps({ onSelectCollection });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    fireEvent.press(screen.getByLabelText('Coleção Ferramentas, 0 repositórios'));
    expect(onSelectCollection).toHaveBeenCalledWith('tools');
  });

  it('toggles the active collection off when the same card is pressed again', () => {
    const onSelectCollection = jest.fn();
    const props = makeProps({ onSelectCollection, activeCollection: 'mobile' });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    fireEvent.press(screen.getByLabelText('Coleção Mobile, 0 repositórios'));
    expect(onSelectCollection).toHaveBeenCalledWith(null);
  });

  it('toggles the active collection off when a second-row card is pressed again', () => {
    const onSelectCollection = jest.fn();
    const props = makeProps({ onSelectCollection, activeCollection: 'ai-ml' });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    fireEvent.press(screen.getByLabelText('Coleção AI & ML, 0 repositórios'));
    expect(onSelectCollection).toHaveBeenCalledWith(null);
  });

  it('renders an empty eyebrow suffix when the active collection id is unknown', () => {
    const props = makeProps({ activeCollection: 'ghost' as unknown as CollectionId });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    expect(screen.getByText('EM')).toBeTruthy();
  });

  it('shows the active collection title in the eyebrow when one is selected', () => {
    const props = makeProps({
      activeCollection: 'backend',
      savedRepos: [makeSavedRepo({ id: 1, language: 'Go' })],
    });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    expect(screen.getByText('EM BACKEND')).toBeTruthy();
  });

  it('shows the "SALVOS RECENTEMENTE" eyebrow with the total when there are saved repos', () => {
    const props = makeProps({
      totalCount: 7,
      savedRepos: [makeSavedRepo({ id: 1 })],
    });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    expect(screen.getByText('SALVOS RECENTEMENTE · 7')).toBeTruthy();
  });

  it('omits the total in the eyebrow when totalCount is zero', () => {
    renderWithProviders(<CollectionsView {...makeProps()} />, { withNavigation: false });

    expect(screen.getByText('SALVOS RECENTEMENTE')).toBeTruthy();
  });

  it('renders the empty state when the filtered list is empty', () => {
    renderWithProviders(<CollectionsView {...makeProps()} />, { withNavigation: false });

    expect(screen.getByText('Nenhum repositório salvo ainda nesta coleção.')).toBeTruthy();
  });

  it('filters savedRepos by the active collection and renders them via renderRow', () => {
    const props = makeProps({
      activeCollection: 'mobile',
      savedRepos: [
        makeSavedRepo({ id: 1, name: 'swift-app', language: 'Swift' }),
        makeSavedRepo({ id: 2, name: 'go-api', language: 'Go' }),
      ],
    });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    expect(screen.getByText('swift-app')).toBeTruthy();
    expect(screen.queryByText('go-api')).toBeNull();
  });

  it('caps the recent list to the first 4 items', () => {
    const repos = Array.from({ length: 6 }, (_, i) =>
      makeSavedRepo({ id: i + 1, fullName: `octo/repo-${i}`, name: `repo-${i}` }),
    );
    const props = makeProps({ totalCount: 6, savedRepos: repos });
    renderWithProviders(<CollectionsView {...props} />, { withNavigation: false });

    expect(screen.getByText('repo-0')).toBeTruthy();
    expect(screen.getByText('repo-3')).toBeTruthy();
    expect(screen.queryByText('repo-4')).toBeNull();
    expect(screen.queryByText('repo-5')).toBeNull();
  });
});
