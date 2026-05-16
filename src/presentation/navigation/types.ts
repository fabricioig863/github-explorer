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
 * Stack interno da tab Design System.
 */
export type DesignSystemStackParamList = {
  DesignSystem: undefined;
};

/**
 * Tab Navigator. Cada tab é um stack — usamos NavigatorScreenParams
 * pra permitir deep linking e navigate cross-tab tipados.
 */
export type TabsParamList = {
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  DesignSystemTab: NavigatorScreenParams<DesignSystemStackParamList>;
};

/**
 * Cada tela em stack aninhado precisa de CompositeScreenProps pra ter
 * type-safety tanto dentro do stack quanto cruzando tabs.
 */
export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, T>,
  BottomTabScreenProps<TabsParamList>
>;

export type DesignSystemStackScreenProps<T extends keyof DesignSystemStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DesignSystemStackParamList, T>,
    BottomTabScreenProps<TabsParamList>
  >;

/**
 * Augmentation global: useNavigation() fica tipado em toda tela sem
 * precisar passar generic manualmente. Pattern oficial do React Navigation.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabsParamList {}
  }
}
