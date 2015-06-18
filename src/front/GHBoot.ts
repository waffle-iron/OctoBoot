/// <reference path="../../node_modules/DefinitelyTyped/handlebars/handlebars.d.ts" />
/// <reference path="../../node_modules/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="definition/Jquery.d.ts" />
/// <reference path="helper/HandlebarHelper.ts" />
/// <reference path="model/ServerAPI.ts" />
/// <reference path="model/UI.ts" />
/// <reference path="controllers/Login.ts" />
/// <reference path="controllers/Sidebar.ts" />
/// <reference path="core/GitHub.ts" />
/// <reference path="core/Socket.ts" />

module GHBoot {

    export var SOCKET_ID: number; //SocketIo id

    export class App {

        private login: controllers.Login;
        private sidebar: controllers.Sidebar;

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
            core.Socket.init().then((sid: number) => {

                core.Socket.io.on("connected", (gat: string) => {
                    this.updateUI(gat);
                    this.login.hide();
                });

                SOCKET_ID = sid;
                done();
            });
        }

        private initUI(): void {
            this.sidebar = new controllers.Sidebar();
            this.login = new controllers.Login();
        }

        private updateUI(gat: string): void {
            core.GitHub.gat = gat;
            this.sidebar.update();
        }
    }
}
