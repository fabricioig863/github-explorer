import '@testing-library/jest-native/extend-expect';

import { notifyManager } from '@tanstack/react-query';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

notifyManager.setScheduler((cb) => cb());
