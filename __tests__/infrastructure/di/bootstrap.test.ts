import { container } from 'src/infra/di/bootstrap';

describe('di/bootstrap', () => {
  it('expõe um container já composto com os 8 use cases', () => {
    expect(typeof container.searchReposUseCase.execute).toBe('function');
    expect(typeof container.getRepoDetailsUseCase.execute).toBe('function');
    expect(typeof container.listIssuesUseCase.execute).toBe('function');
    expect(typeof container.countOpenIssuesUseCase.execute).toBe('function');
    expect(typeof container.listSavedReposUseCase.execute).toBe('function');
    expect(typeof container.saveRepoUseCase.execute).toBe('function');
    expect(typeof container.unsaveRepoUseCase.execute).toBe('function');
    expect(typeof container.isRepoSavedUseCase.execute).toBe('function');
  });

  it('container é um singleton estável (mesma referência entre imports)', () => {
    const again = require('src/infra/di/bootstrap');
    expect(again.container).toBe(container);
  });
});
