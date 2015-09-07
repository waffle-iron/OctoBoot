/// <reference path="../core/Repos.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Sidebar extends Handlebar {

        public selectedRepo: core.Repos;
        public publicRepos: Array<model.GitHubRepo>;
        public privateRepos: Array<model.GitHubRepo>;

        constructor() {
            super(model.UI.HB_SIDEBAR);
            this.initWithContext(null).sidebar({ closable: false }).sidebar('setting', 'transition', 'push').sidebar('hide');
        }

        public update(): void {
            this.jDom.sidebar('show');
            core.GitHub.getUser((user: model.GitHubUser) => helper.HandlebarHelper.updateTemplate(model.UI.HB_PROFIL, user))
            core.GitHub.getRepos(model.RepoType.PUBLIC, (repos: Array<model.GitHubRepo>) => { this.publicRepos = repos; this.updateTemplateRepo(model.RepoType.PUBLIC, repos) });
            core.GitHub.getRepos(model.RepoType.PRIVATE, (repos: Array<model.GitHubRepo>) => { this.privateRepos = repos; this.updateTemplateRepo(model.RepoType.PRIVATE, repos) });
        }

        private updateTemplateRepo(type: string, repos: Array<model.GitHubRepo>): void {
            var formatedType: string = type.charAt(0).toUpperCase() + type.slice(1);
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleHandlers: this.titleHandlers(),
                repoHandlers: this.repoHandlers(type),
                newHandlers: this.newHandlers(type),
                repos: repos,
                title: formatedType
            }, 'Repos' + formatedType);
        }

        private titleHandlers(): model.HTMLEvent {
            return { click: function() { $(this).parent().children('.menu').slideToggle(500) } }
        }

        private repoHandlers(type: string): model.HTMLEvent {
            var __this = this;
            return { click: function() { __this.select(__this, this, type) } }
        }

        private newHandlers(type: string): model.HTMLEvent {
            return { click: () => { this.select(this, null, type) } }
        }

        private select(__this: Sidebar, button: HTMLElement, type: string): void {
            this.jDom.sidebar({ closable: true });
            
            if (__this.selectedRepo) {
                __this.selectedRepo.destroy();
            }

            __this.selectedRepo = new core.Repos(
                button ? button.innerText || button.innerHTML.trim() : null,
                button ? button.getAttribute('data-url') : null,
                type,
                button ? button : null)

            // if no button, it's a repo creation
            if (!button) {
                __this.selectedRepo.onCreate = (name: string, url: string) => {
                    var repos: Array<model.GitHubRepo> = type === model.RepoType.PUBLIC ? this.publicRepos : this.privateRepos;
                    // push a fake|temp repo on sidebar (GitHub api has some delay)
                    repos.unshift(model.GitHubRepoTemplate({ name: name, clone_url: url }));
                    this.updateTemplateRepo(type, repos);
                    // fill missing sidebarButton to change button state
                    __this.selectedRepo.sidebarButton = $('.Repos' + type.charAt(0).toUpperCase() + type.slice(1)).find('.repo' + name).get(0);
                }
            }
        }
    }
}
