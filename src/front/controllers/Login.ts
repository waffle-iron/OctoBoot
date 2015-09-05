/// <reference path="Alert.ts" />
/// <reference path="../core/Socket.ts" />

module OctoBoot.controllers {

    export class Login {

        private alert: Alert;

        constructor() {}

        public isLogged(): JQueryXHR {
            return $.get(model.ServerAPI.IS_LOGGED.replace(/:sid/, core.Socket.sid.toString()));
        }

        public show(): void {
            this.alert = new controllers.Alert({
                title: model.UI.LOGIN_TITLE,
                body: model.UI.LOGIN_BODY,
                onApprove: () => this.connectGitHub(),
                icon: 'github square'
            });
        }

        public hide(): void {
            this.alert.hide();
        }

        private connectGitHub(): boolean {
            window.location.href = model.ServerAPI.GITHUB_LOGIN.replace(/:sid/, core.Socket.sid.toString());
            return false;
        }
    }
}
