import type { Container } from 'src/infra/di/container';

export type FakeContainer = {
  [K in keyof Container]: { execute: jest.Mock };
};

export const makeFakeContainer = (): FakeContainer => ({
  searchReposUseCase: { execute: jest.fn() },
  getRepoDetailsUseCase: { execute: jest.fn() },
  listIssuesUseCase: { execute: jest.fn() },
  countOpenIssuesUseCase: { execute: jest.fn() },
  listSavedReposUseCase: { execute: jest.fn() },
  saveRepoUseCase: { execute: jest.fn() },
  unsaveRepoUseCase: { execute: jest.fn() },
  isRepoSavedUseCase: { execute: jest.fn() },
});
