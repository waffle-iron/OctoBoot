/// <reference path="../model/GitHubUser.ts" />

module GHBoot.modules {

    // @See node_modules/DefinitelyTyped/handlebars/handlebars.d.ts#7
    declare var Handlebars: HandlebarsRuntimeStatic;

    export interface SidebarContext {
        user?: model.GitHubUser;
    }

    export class Sidebar {

        public html: string;
        public context: SidebarContext;

        constructor() {
            Handlebars.registerPartial('profil', Handlebars.templates[model.UI.HB_PROFIL]);
            Handlebars.registerPartial('repos_public', Handlebars.templates[model.UI.HB_REPOS_PUBLIC]);
            this.context = {};
        }

        public bindSocketIo(socket: SocketIOClient.Socket): void {
            socket.on("user", (data: model.GitHubUser) => {
                this.context.user = data;
                this.updateTemplate();
            });

            socket.on("repos_public", (data: model.GitHubUser) => {
                console.log(data);
            });

            socket.on("repos_private", (data: model.GitHubUser) => {
                console.log(data);
            });
        }

        public updateTemplate(context?: SidebarContext): void {
            var c: SidebarContext = context || this.context;
            this.html = Handlebars.templates[model.UI.HB_SIDEBAR](c);

            $(model.UI.SIDEBAR).remove();
            $(document.body).append(this.html);
            $(model.UI.SIDEBAR).sidebar("attach events", model.UI.SIDEBAR_LAUNCH_BT);
        }
    }
}
