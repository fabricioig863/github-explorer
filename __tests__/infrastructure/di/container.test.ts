import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';
import { createContainer, type ContainerDeps } from 'src/infra/di/container';

function fakeRepoRepository(): IRepoRepository {
  return {
    search: jest.fn(),
    getDetails: jest.fn(),
  } as unknown as IRepoRepository;
}

function fakeIssueRepository(): IIssueRepository {
  return {
    list: jest.fn(),
    countOpen: jest.fn(),
  } as unknown as IIssueRepository;
}

function fakeSavedReposRepository(): ISavedReposRepository {
  return {
    list: jest.fn(),
    save: jest.fn(),
    unsave: jest.fn(),
    isSaved: jest.fn(),
  } as unknown as ISavedReposRepository;
}

function makeDeps(overrides: Partial<ContainerDeps> = {}): ContainerDeps {
  return {
    repoRepository: fakeRepoRepository(),
    issueRepository: fakeIssueRepository(),
    savedReposRepository: fakeSavedReposRepository(),
    ...overrides,
  };
}

function readInjectedRepo(useCase: object, key: string): unknown {
  return Reflect.get(useCase, key);
}

describe('createContainer', () => {
  describe('shape', () => {
    it('expõe os 8 use cases esperados, todos com método execute', () => {
      const c = createContainer(makeDeps());

      expect(typeof c.searchReposUseCase.execute).toBe('function');
      expect(typeof c.getRepoDetailsUseCase.execute).toBe('function');
      expect(typeof c.listIssuesUseCase.execute).toBe('function');
      expect(typeof c.countOpenIssuesUseCase.execute).toBe('function');
      expect(typeof c.listSavedReposUseCase.execute).toBe('function');
      expect(typeof c.saveRepoUseCase.execute).toBe('function');
      expect(typeof c.unsaveRepoUseCase.execute).toBe('function');
      expect(typeof c.isRepoSavedUseCase.execute).toBe('function');
    });
  });

  describe('injeção de dependência', () => {
    it('use cases recebem exatamente os repositórios passados em deps', () => {
      const deps = makeDeps();
      const c = createContainer(deps);

      expect(readInjectedRepo(c.searchReposUseCase, 'repoRepository')).toBe(deps.repoRepository);
      expect(readInjectedRepo(c.getRepoDetailsUseCase, 'repoRepository')).toBe(deps.repoRepository);

      expect(readInjectedRepo(c.listIssuesUseCase, 'issueRepository')).toBe(deps.issueRepository);
      expect(readInjectedRepo(c.countOpenIssuesUseCase, 'issueRepository')).toBe(
        deps.issueRepository,
      );

      expect(readInjectedRepo(c.listSavedReposUseCase, 'savedReposRepository')).toBe(
        deps.savedReposRepository,
      );
      expect(readInjectedRepo(c.saveRepoUseCase, 'savedReposRepository')).toBe(
        deps.savedReposRepository,
      );
      expect(readInjectedRepo(c.unsaveRepoUseCase, 'savedReposRepository')).toBe(
        deps.savedReposRepository,
      );
      expect(readInjectedRepo(c.isRepoSavedUseCase, 'savedReposRepository')).toBe(
        deps.savedReposRepository,
      );
    });

    it('use cases que compartilham mesma interface compartilham a mesma instância (não duplica)', () => {
      const c = createContainer(makeDeps());

      expect(readInjectedRepo(c.searchReposUseCase, 'repoRepository')).toBe(
        readInjectedRepo(c.getRepoDetailsUseCase, 'repoRepository'),
      );
      expect(readInjectedRepo(c.listIssuesUseCase, 'issueRepository')).toBe(
        readInjectedRepo(c.countOpenIssuesUseCase, 'issueRepository'),
      );
      expect(readInjectedRepo(c.saveRepoUseCase, 'savedReposRepository')).toBe(
        readInjectedRepo(c.listSavedReposUseCase, 'savedReposRepository'),
      );
    });

    it('chamadas independentes produzem containers independentes (sem estado global)', () => {
      const a = createContainer(makeDeps());
      const b = createContainer(makeDeps());

      expect(a.searchReposUseCase).not.toBe(b.searchReposUseCase);
      expect(readInjectedRepo(a.searchReposUseCase, 'repoRepository')).not.toBe(
        readInjectedRepo(b.searchReposUseCase, 'repoRepository'),
      );
    });
  });
});
