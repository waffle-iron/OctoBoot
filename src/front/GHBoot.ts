/// <reference path="../../node_modules/DefinitelyTyped/handlebars/handlebars.d.ts" />
/// <reference path="../../node_modules/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../../node_modules/DefinitelyTyped/socket.io-client/socket.io-client.d.ts" />
/// <reference path="definition/Jquery.d.ts" />
/// <reference path="model/ServerAPI.ts" />
/// <reference path="model/UI.ts" />
/// <reference path="modules/Login.ts" />
/// <reference path="modules/Sidebar.ts" />

module GHBoot {

    export class App {

        private login: modules.Login;
        private sidebar: modules.Sidebar;

        private sid: number; //SocketIo id
        private socket: SocketIOClient.Socket;

        constructor() {
            this.initUI();

            this.initSocket().then((sid: number) => {

                this.sidebar.bindSocketIo(this.socket);

                this.login.isLogged(sid).then(() => {
                    console.log("OK");
                }).fail(() => {
                    this.login.show(sid);
                });
            });
        }

        private initUI(): void {
            this.sidebar = new modules.Sidebar();
            this.login = new modules.Login();
        }

        private initSocket(): any {
            this.socket = io("http://" + window.location.host);
            this.socket.on("connected", () => this.login.hide());

            return {
                then: (f: Function) => {
                    this.socket.on("sid", (data: number) => {
                        this.sid = data;
                        f(this.sid);
                    });
                }
            }
        }
    }
}
