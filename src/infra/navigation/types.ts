import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ExploreStackParamList = {
  Search: undefined;
  RepoDetail: { owner: string; repo: string };
  Issues: { owner: string; repo: string };
};

export type TabsParamList = {
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  SavedTab: undefined;
};

export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, T>,
  BottomTabScreenProps<TabsParamList>
>;

export type ProfileTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'SavedTab'>,
  NativeStackScreenProps<ExploreStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabsParamList {}
  }
}
