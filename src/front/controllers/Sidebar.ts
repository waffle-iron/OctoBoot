/// <reference path="../core/Repos.ts" />
/// <reference path="../model/HTMLEvent.ts" />

module GHBoot.controllers {

    export class Sidebar {

        public selected: core.Repos;

        constructor() {
            $(document.body)
                .append(Handlebars.templates[model.UI.HB_SIDEBAR](null));
            $(helper.HandlebarHelper.formatId(model.UI.HB_SIDEBAR, '.'))
                .sidebar("attach events", model.UI.SIDEBAR_LAUNCH_BT);
        }

        public update(): void {
            core.GitHub.getUser((user: model.GitHubUser) => helper.HandlebarHelper.updateTemplate(model.UI.HB_PROFIL, user))
            core.GitHub.getRepos(model.RepoType.PUBLIC, (repos: Array<model.GitHubRepo>) => this.updateTemplateRepo('Public', repos));
            core.GitHub.getRepos(model.RepoType.PRIVATE, (repos: Array<model.GitHubRepo>) => this.updateTemplateRepo('Private', repos));
        }

        private updateTemplateRepo(type: string, data: Array<model.GitHubRepo>): void {
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                titleEvent: this.titleEvent(),
                repoEvent: this.repoEvent(type),
                newEvent: this.newEvent(type),
                repos: data,
                title: type
            }, 'Repos' + type);
        }

        private titleEvent(): model.HTMLEvent {
            return { click: function() { $(this).parent().children('.menu').slideToggle(500) } }
        }

        private repoEvent(type: string): model.HTMLEvent {
            var __this = this;
            return { click: function() { __this.selected = new core.Repos(this.innerText, this.getAttribute('data-url'), type) } }
        }

        private newEvent(type: string): model.HTMLEvent {
            return { click: () => this.selected = new core.Repos(null, null, type) }
        }
    }
}
