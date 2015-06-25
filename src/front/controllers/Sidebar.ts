/// <reference path="../core/Repos.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Sidebar extends Handlebar {

        public selected: core.Repos;

        constructor() {
            super(model.UI.HB_SIDEBAR);
            this.initWithContext(null).sidebar("attach events", model.UI.SIDEBAR_LAUNCH_BT);
        }

        public update(): void {
            core.GitHub.getUser((user: model.GitHubUser) => helper.HandlebarHelper.updateTemplate(model.UI.HB_PROFIL, user))
            core.GitHub.getRepos(model.RepoType.PUBLIC, (repos: Array<model.GitHubRepo>) => this.updateTemplateRepo('Public', repos));
            core.GitHub.getRepos(model.RepoType.PRIVATE, (repos: Array<model.GitHubRepo>) => this.updateTemplateRepo('Private', repos));
        }

        private updateTemplateRepo(type: string, data: Array<model.GitHubRepo>): void {
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleHandlers: this.titleHandlers(),
                repoHandlers: this.repoHandlers(type),
                newHandlers: this.newHandlers(type),
                repos: data,
                title: type
            }, 'Repos' + type);
        }

        private titleHandlers(): model.HTMLEvent {
            return { click: function() { $(this).parent().children('.menu').slideToggle(500) } }
        }

        private repoHandlers(type: string): model.HTMLEvent {
            var __this = this;
            return { click: function() { __this.select(__this, this, type) } }
        }

        private newHandlers(type: string): model.HTMLEvent {
            return { click: () => { this.select(null, null, type) } }
        }

        private select(classContext: any, buttonContext: any, type: string): void {
            if (classContext.selected) {
                classContext.selected.destroy();
            }

            classContext.selected = new core.Repos(
                buttonContext ? buttonContext.innerText : null,
                buttonContext ? buttonContext.getAttribute('data-url') : null,
                type,
                buttonContext ? buttonContext : null)
        }
    }
}
