import '@testing-library/jest-native/extend-expect';

import { notifyManager } from '@tanstack/react-query';

import { server } from './msw/server';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

notifyManager.setScheduler((cb) => cb());

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
