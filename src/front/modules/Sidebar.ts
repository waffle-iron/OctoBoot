/// <reference path="../model/GitHubUser.ts" />
/// <reference path="../model/GitHubRepo.ts" />

module GHBoot.modules {

    // @See node_modules/DefinitelyTyped/handlebars/handlebars.d.ts#7
    declare var Handlebars: HandlebarsRuntimeStatic;

    export class Sidebar {

        constructor() {
            $(document.body)
                .append(Handlebars.templates[model.UI.HB_SIDEBAR](null));
            $(helper.HandlebarHelper.formatId(model.UI.HB_SIDEBAR, '.'))
                .sidebar("attach events", model.UI.SIDEBAR_LAUNCH_BT);
        }

        public bindSocketIo(socket: SocketIOClient.Socket): void {
            socket.on("user", (data: model.GitHubUser) => {
                helper.HandlebarHelper.updateTemplate(model.UI.HB_PROFIL, data);
            });

            socket.on("repos_public", (data: Array<model.GitHubRepo>) => {
                this.updateTemplateRepo('Public', data);
            });

            socket.on("repos_private", (data: Array<model.GitHubRepo>) => {
                this.updateTemplateRepo('Private', data);
            });
        }

        private updateTemplateRepo(type: string, data: Array<model.GitHubRepo>): void {
            helper.HandlebarHelper.updateTemplate(model.UI.HB_REPOS, {
                on: { click: function() { $(this).parent().children('.menu').slideToggle(500) } },
                repos: data,
                title: type
            }, 'Repos' + type);
        }
    }
}
