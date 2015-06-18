/// <reference path="Alert.ts" />

module OctoBoot.controllers {

    export class Login {

        private alert: Alert;

        constructor() {}

        public isLogged(): JQueryXHR {
            return $.get(model.ServerAPI.IS_LOGGED.replace(/:sid/, SOCKET_ID.toString()));
        }

        public show(): void {
            this.alert = new controllers.Alert(model.UI.LOGIN_TITLE, model.UI.LOGIN_BODY, () => this.connectGitHub(), false, 'github square');
        }

        public hide(): void {
            this.alert.hide();
        }

        private connectGitHub(): boolean {
            window.open(model.ServerAPI.GITHUB_LOG.replace(/:sid/, SOCKET_ID.toString()), "", "width=1050, height=700, scrollbars=1");
            return false;
        }
    }
}
