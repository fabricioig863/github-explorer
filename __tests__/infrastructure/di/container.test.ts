import type { Container } from 'src/infra/di/container';

// `private readonly repoRepository` em TS é só type-level — a propriedade existe
// como atributo público no runtime. `Reflect.get` permite inspecionar sem cast
// proibido (`as unknown as X`); a anotação `: unknown` restringe o `any` que
// `Reflect.get` retornaria.
function readRepo(useCase: object, key: string): unknown {
  return Reflect.get(useCase, key);
}

// `jest.isolateModules` re-avalia o módulo, criando uma NOVA referência da classe.
// `instanceof` contra a classe importada no topo do arquivo falha porque é uma
// instância diferente da mesma classe. Comparar por `constructor.name` evita
// o false negative e ainda valida que a categoria correta foi instanciada.
function repoClassNameOf(value: unknown): string | undefined {
  if (value === null || typeof value !== 'object') return undefined;
  const proto = Object.getPrototypeOf(value) as unknown;
  if (proto === null || typeof proto !== 'object') return undefined;
  const ctor = Reflect.get(proto, 'constructor');
  if (typeof ctor !== 'function') return undefined;
  return ctor.name;
}

function loadContainerWith(envValue: string | undefined): Container {
  const original = process.env.EXPO_PUBLIC_USE_MOCK;
  if (envValue === undefined) {
    delete process.env.EXPO_PUBLIC_USE_MOCK;
  } else {
    process.env.EXPO_PUBLIC_USE_MOCK = envValue;
  }

  let container!: Container;
  jest.isolateModules(() => {
    container = require('src/infra/di/container').container as Container;
  });

  if (original === undefined) {
    delete process.env.EXPO_PUBLIC_USE_MOCK;
  } else {
    process.env.EXPO_PUBLIC_USE_MOCK = original;
  }
  return container;
}

describe('container DI', () => {
  describe('shape: registro de todos os use cases', () => {
    it('expõe os 8 use cases esperados, nenhum undefined', () => {
      const c = loadContainerWith(undefined);

      expect(c.searchReposUseCase).toBeDefined();
      expect(c.getRepoDetailsUseCase).toBeDefined();
      expect(c.listIssuesUseCase).toBeDefined();
      expect(c.countOpenIssuesUseCase).toBeDefined();
      expect(c.listSavedReposUseCase).toBeDefined();
      expect(c.saveRepoUseCase).toBeDefined();
      expect(c.unsaveRepoUseCase).toBeDefined();
      expect(c.isRepoSavedUseCase).toBeDefined();

      // Cada use case expõe execute()
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

  describe('USE_MOCK=true (default) → adapters In-Memory', () => {
    it.each([
      ['EXPO_PUBLIC_USE_MOCK undefined', undefined],
      ['EXPO_PUBLIC_USE_MOCK = "true"', 'true'],
      ['EXPO_PUBLIC_USE_MOCK = "anything-but-false"', 'yes'],
    ])('com %s, use cases recebem InMemory* repos', (_label, env) => {
      const c = loadContainerWith(env);

      expect(repoClassNameOf(readRepo(c.searchReposUseCase, 'repoRepository'))).toBe(
        'InMemoryRepoRepository',
      );
      expect(repoClassNameOf(readRepo(c.getRepoDetailsUseCase, 'repoRepository'))).toBe(
        'InMemoryRepoRepository',
      );

      expect(repoClassNameOf(readRepo(c.listIssuesUseCase, 'issueRepository'))).toBe(
        'InMemoryIssueRepository',
      );
      expect(repoClassNameOf(readRepo(c.countOpenIssuesUseCase, 'issueRepository'))).toBe(
        'InMemoryIssueRepository',
      );

      expect(repoClassNameOf(readRepo(c.listSavedReposUseCase, 'savedReposRepository'))).toBe(
        'InMemorySavedReposRepository',
      );
      expect(repoClassNameOf(readRepo(c.saveRepoUseCase, 'savedReposRepository'))).toBe(
        'InMemorySavedReposRepository',
      );
      expect(repoClassNameOf(readRepo(c.unsaveRepoUseCase, 'savedReposRepository'))).toBe(
        'InMemorySavedReposRepository',
      );
      expect(repoClassNameOf(readRepo(c.isRepoSavedUseCase, 'savedReposRepository'))).toBe(
        'InMemorySavedReposRepository',
      );
    });

    it('use cases que compartilham a mesma interface compartilham a mesma instância de repo (não duplica)', () => {
      const c = loadContainerWith(undefined);

      expect(readRepo(c.searchReposUseCase, 'repoRepository')).toBe(
        readRepo(c.getRepoDetailsUseCase, 'repoRepository'),
      );
      expect(readRepo(c.listIssuesUseCase, 'issueRepository')).toBe(
        readRepo(c.countOpenIssuesUseCase, 'issueRepository'),
      );
      expect(readRepo(c.saveRepoUseCase, 'savedReposRepository')).toBe(
        readRepo(c.listSavedReposUseCase, 'savedReposRepository'),
      );
    });
  });

  describe('USE_MOCK=false → adapters reais (GitHub HTTP + AsyncStorage)', () => {
    it('com EXPO_PUBLIC_USE_MOCK="false", use cases recebem GitHubRepoRepository / GitHubIssueRepository / AsyncStorageSavedReposRepository', () => {
      const c = loadContainerWith('false');

      expect(repoClassNameOf(readRepo(c.searchReposUseCase, 'repoRepository'))).toBe(
        'GitHubRepoRepository',
      );
      expect(repoClassNameOf(readRepo(c.getRepoDetailsUseCase, 'repoRepository'))).toBe(
        'GitHubRepoRepository',
      );

      expect(repoClassNameOf(readRepo(c.listIssuesUseCase, 'issueRepository'))).toBe(
        'GitHubIssueRepository',
      );
      expect(repoClassNameOf(readRepo(c.countOpenIssuesUseCase, 'issueRepository'))).toBe(
        'GitHubIssueRepository',
      );

      expect(repoClassNameOf(readRepo(c.listSavedReposUseCase, 'savedReposRepository'))).toBe(
        'AsyncStorageSavedReposRepository',
      );
      expect(repoClassNameOf(readRepo(c.saveRepoUseCase, 'savedReposRepository'))).toBe(
        'AsyncStorageSavedReposRepository',
      );
      expect(repoClassNameOf(readRepo(c.unsaveRepoUseCase, 'savedReposRepository'))).toBe(
        'AsyncStorageSavedReposRepository',
      );
      expect(repoClassNameOf(readRepo(c.isRepoSavedUseCase, 'savedReposRepository'))).toBe(
        'AsyncStorageSavedReposRepository',
      );
    });
  });
});
