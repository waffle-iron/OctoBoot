/// <reference path="../model/GitHubUser.ts" />

module GHBoot.modules {

    // @See node_modules/DefinitelyTyped/handlebars/handlebars.d.ts#7
    declare var Handlebars: HandlebarsRuntimeStatic;

    export interface SideBarContext {
        user?: model.GitHubUser;
    }

    export class Sidebar {

        public template: HandlebarsTemplateDelegate;
        public html: string;
        public context: SideBarContext;

        constructor() {
            this.template = Handlebars.templates[model.UI.HB_SIDEBAR];
            this.context = {};
        }

        public bindSocketIo(socket: SocketIOClient.Socket): void {
            socket.on("user", (data: model.GitHubUser) => {
                this.context.user = data;
                this.updateTemplate();
            });
        }

        public updateTemplate(context?: SideBarContext): void {
            var c: SideBarContext = context || this.context;
            this.html = this.template(c);

            $(model.UI.SIDEBAR).remove();
            $(document.body).append(this.html);
            $(model.UI.SIDEBAR).sidebar("attach events", model.UI.SIDEBAR_LAUNCH_BT);
        }
    }
}
