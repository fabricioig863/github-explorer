import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Stack interno da tab Explorar.
 * Search é a tela raiz (sem params).
 * RepoDetail e Issues recebem owner+repo.
 */
export type ExploreStackParamList = {
  Search: undefined;
  RepoDetail: { owner: string; repo: string };
  Issues: { owner: string; repo: string };
};

/**
 * Tab Navigator. Profile é tab direta (sem stack próprio).
 */
export type TabsParamList = {
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  ProfileTab: undefined;
};

/**
 * Cada tela em stack aninhado precisa de CompositeScreenProps pra ter
 * type-safety tanto dentro do stack quanto cruzando tabs.
 */
export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, T>,
  BottomTabScreenProps<TabsParamList>
>;

export type ProfileTabScreenProps = BottomTabScreenProps<TabsParamList, 'ProfileTab'>;

/**
 * Augmentation global: useNavigation() fica tipado em toda tela sem
 * precisar passar generic manualmente. Pattern oficial do React Navigation.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabsParamList {}
  }
}
