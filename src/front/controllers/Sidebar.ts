/// <reference path="../core/Repos.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../controllers/CreateTemplate.ts" />
/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Sidebar extends Handlebar {

        public selected: core.Repos;
        public repos_public: Array<model.GitHubRepo>;
        public repos_private: Array<model.GitHubRepo>;
        public repo_template: model.GitHubRepo;

        constructor() {
            super(model.UI.HB_SIDEBAR);
            this.initWithContext(null).sidebar({ closable: false }).sidebar('setting', 'transition', 'push').sidebar('hide');
        }

        public update(): void {
            this.jDom.sidebar('show');
            core.GitHub.getUser((user: model.GitHubUser) => helper.HandlebarHelper.updateTemplate(model.UI.HB_PROFIL, user))
            core.GitHub.getRepos(model.RepoType.PUBLIC, (repos: Array<model.GitHubRepo>) => { this.repos_public = repos; this.update_view_repo(model.RepoType.PUBLIC, repos) });
            core.GitHub.getRepos(model.RepoType.PRIVATE, (repos: Array<model.GitHubRepo>) => { this.repos_private = repos; this.update_view_repo(model.RepoType.PRIVATE, repos) });
            this.update_view_template()
        }

        private update_view_repo(type: string, repos: Array<model.GitHubRepo>): void {
            var formatedType: string = type.charAt(0).toUpperCase() + type.slice(1);
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleHandlers: this.handlers_title(),
                repoHandlers: this.handlers_repo(type),
                newHandlers: this.handlers_new_repo(type),
                repos: repos,
                title: formatedType
            }, 'Repos' + formatedType);

            this.check_for_template(repos);
        }

        private update_view_template(dir?: model.GitHubTree): void {
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleHandlers: this.handlers_title(),
                repoHandlers: null,
                newHandlers: this.handler_new_template(),
                repos: dir ? dir.tree.map((sub: model.GitHubTreeFile) => { sub.name = sub.path; return sub }) : [],
                title: 'Template'
            }, 'ReposTemplates');
        }

        private check_for_template(repos: Array<model.GitHubRepo>): void {
            repos.forEach(function(repo: model.GitHubRepo) {
                if (repo.name === CreateTemplate.NAME_REPO_TEMPLATE) {
                    this.repo_template = repo;
                    core.GitHub.getTree(repo.name, (dir: model.GitHubTree) => this.update_view_template(dir));
                }
            })
        }

        private handlers_title(): model.HTMLEvent {
            return { click: function() { $(this).parent().children('.menu').slideToggle(500) } }
        }

        private handlers_repo(type: string): model.HTMLEvent {
            var __this = this;
            return { click: function() { __this.select_repo(__this, this, type) } }
        }

        private handlers_new_repo(type: string): model.HTMLEvent {
            return { click: () => { this.select_repo(this, null, type) } }
        }

        private handler_new_template(): model.HTMLEvent {
            return {
                click: () => {
                    let template: CreateTemplate = new CreateTemplate(
                        this.repo_template,
                        () => { // done
                            this.repo_template = this.repo_template || template.repo;
                            core.GitHub.getTree(this.repo_template.name, (dir: model.GitHubTree) => this.update_view_template(dir))
                        }
                    )
                }
            }
        }

        private select_repo(__this: Sidebar, button: HTMLElement, type: string): void {
            this.jDom.sidebar({ closable: true });

            if (__this.selected) {
                __this.selected.destroy();
            }

            __this.selected = new core.Repos(
                button ? button.innerText || button.innerHTML.trim() : null,
                button ? button.getAttribute('data-url') : null,
                type,
                button ? button : null)

            // if no button, it's a repo creation
            if (!button) {
                __this.selected.onCreate = (name: string, url: string) => {
                    var repos: Array<model.GitHubRepo> = type === model.RepoType.PUBLIC ? this.repos_public : this.repos_private;
                    // push a fake|temp repo on sidebar (GitHub api has some delay)
                    repos.unshift(model.GitHubRepoTemplate({ name: name, clone_url: url }));
                    this.update_view_repo(type, repos);
                    // fill missing sidebarButton to change button state
                    __this.selected.sidebarButton = $('.Repos' + type.charAt(0).toUpperCase() + type.slice(1)).find('.repo' + name).get(0);
                }
            }
        }
    }
}
