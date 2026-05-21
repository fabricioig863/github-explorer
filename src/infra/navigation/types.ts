import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Rotas de detalhe de repositório. Vivem nas duas pilhas (Explore e Saved):
 * as telas RepoDetail e Issues são registradas em ambas e tipadas contra
 * este subconjunto compartilhado.
 */
export type RepoStackParamList = {
  RepoDetail: { owner: string; repo: string };
  Issues: { owner: string; repo: string };
};

export type ExploreStackParamList = RepoStackParamList & {
  Search: undefined;
};

export type SavedStackParamList = RepoStackParamList & {
  Saved: undefined;
};

export type TabsParamList = {
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  SavedTab: NavigatorScreenParams<SavedStackParamList>;
};

export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, T>,
  BottomTabScreenProps<TabsParamList>
>;

export type SavedStackScreenProps<T extends keyof SavedStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SavedStackParamList, T>,
  BottomTabScreenProps<TabsParamList>
>;

/** Props das telas compartilhadas entre as pilhas Explore e Saved. */
export type RepoStackScreenProps<T extends keyof RepoStackParamList> = NativeStackScreenProps<
  RepoStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabsParamList {}
  }
}
