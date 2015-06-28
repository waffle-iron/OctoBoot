/// <reference path="definition/handlebars.d.ts" />
/// <reference path="definition/jquery.d.ts" />
/// <reference path="definition/jquery.plugin.d.ts" />
/// <reference path="helper/HandlebarHelper.ts" />
/// <reference path="model/ServerAPI.ts" />
/// <reference path="model/UI.ts" />
/// <reference path="controllers/Login.ts" />
/// <reference path="controllers/Sidebar.ts" />
/// <reference path="controllers/Toolsbar.ts" />
/// <reference path="controllers/Stage.ts" />
/// <reference path="controllers/Templates.ts" />
/// <reference path="core/GitHub.ts" />
/// <reference path="core/Socket.ts" />

module OctoBoot {

    export class App {

        private login: controllers.Login;
        private sidebar: controllers.Sidebar;
        private toolsbar: controllers.Toolsbar;
        private stage: controllers.Stage;

        private gat: string;

        constructor() {
            helper.HandlebarHelper.register();

            this.initSocket(() => {
                this.initUI();

                this.login.isLogged().done((gat: string) => {
                    console.log("OK", gat);
                    this.updateUI(gat);
                }).fail(() => {
                    this.login.show();
                });
            });
        }

        private initSocket(done: () => any): void {
            core.Socket.init().then(() => {

                core.Socket.io.on("connected", (gat: string) => {
                    this.updateUI(gat);
                    this.login.hide();
                });

                done();
            });
        }

        private initUI(): void {
            this.toolsbar = new controllers.Toolsbar();
            this.stage = new controllers.Stage();
            this.sidebar = new controllers.Sidebar();
            this.login = new controllers.Login();
        }

        private updateUI(gat: string): void {
            core.GitHub.gat = gat;
            this.sidebar.update();
        }
    }
}
