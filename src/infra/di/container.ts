import { CountOpenIssuesUseCase } from '@/application/use-cases/CountOpenIssuesUseCase';
import { GetRepoDetailsUseCase } from '@/application/use-cases/GetRepoDetailsUseCase';
import { IsRepoSavedUseCase } from '@/application/use-cases/IsRepoSavedUseCase';
import { ListIssuesUseCase } from '@/application/use-cases/ListIssuesUseCase';
import { ListSavedReposUseCase } from '@/application/use-cases/ListSavedReposUseCase';
import { SaveRepoUseCase } from '@/application/use-cases/SaveRepoUseCase';
import { SearchReposUseCase } from '@/application/use-cases/SearchReposUseCase';
import { UnsaveRepoUseCase } from '@/application/use-cases/UnsaveRepoUseCase';
import type { IIssueRepository } from '@/domain/repositories/IIssueRepository';
import type { IRepoRepository } from '@/domain/repositories/IRepoRepository';
import type { ISavedReposRepository } from '@/domain/repositories/ISavedReposRepository';

export interface ContainerDeps {
  repoRepository: IRepoRepository;
  issueRepository: IIssueRepository;
  savedReposRepository: ISavedReposRepository;
}

export interface Container {
  searchReposUseCase: SearchReposUseCase;
  getRepoDetailsUseCase: GetRepoDetailsUseCase;
  listIssuesUseCase: ListIssuesUseCase;
  countOpenIssuesUseCase: CountOpenIssuesUseCase;
  listSavedReposUseCase: ListSavedReposUseCase;
  saveRepoUseCase: SaveRepoUseCase;
  unsaveRepoUseCase: UnsaveRepoUseCase;
  isRepoSavedUseCase: IsRepoSavedUseCase;
}

export const createContainer = (deps: ContainerDeps): Container => ({
  searchReposUseCase: new SearchReposUseCase(deps.repoRepository),
  getRepoDetailsUseCase: new GetRepoDetailsUseCase(deps.repoRepository),
  listIssuesUseCase: new ListIssuesUseCase(deps.issueRepository),
  countOpenIssuesUseCase: new CountOpenIssuesUseCase(deps.issueRepository),
  listSavedReposUseCase: new ListSavedReposUseCase(deps.savedReposRepository),
  saveRepoUseCase: new SaveRepoUseCase(deps.savedReposRepository),
  unsaveRepoUseCase: new UnsaveRepoUseCase(deps.savedReposRepository),
  isRepoSavedUseCase: new IsRepoSavedUseCase(deps.savedReposRepository),
});
