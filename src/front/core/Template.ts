/// <reference path="../controllers/Stage.ts" />
/// <reference path="../controllers/Toolsbar.ts" />
/// <reference path="../definition/jquery.plugin.d.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/ServerApi.ts" />
/// <reference path="./Socket.ts" />

module OctoBoot.core {

    export class Template {

        public stage: controllers.Stage;

        private toolsbar: controllers.Toolsbar;

        constructor(public name: string, public repo_url: string, public sidebar: JQuery, public sidebarButton?: HTMLElement) {
            this.setState(REPO_STATE.LOADING);
            this.open(model.ServerAPI.getProjectPath(Socket.sid, model.ServerAPI.TEMPLATE_REPO_NAME) + name);
        }

        public destroy(): void {
            this.setState(REPO_STATE.UNSELECT);
            if (this.stage) {
                this.stage.destroy();
            }
        }

        private open(url: string): void {
            this.setState(REPO_STATE.SELECT);
            this.stage = new controllers.Stage(url);
            this.toolsbar = new controllers.Toolsbar(model.ServerAPI.TEMPLATE_REPO_NAME, this.stage, this.repo_url, this.sidebar);
        }

        private setState(state: REPO_STATE): void {
            switch (state) {
                case REPO_STATE.LOADING:
                    if (this.sidebarButton) this.sidebarButton.innerHTML = this.name + ' <i class="spinner loading icon" > </i>';
                    break;

                case REPO_STATE.SELECT:
                    if (this.sidebarButton) this.sidebarButton.innerHTML = this.name + ' <i class="checkmark icon" > </i>';
                    $(helper.HandlebarHelper.formatId(model.UI.HB_SIDEBAR, '.')).sidebar('toggle');
                    break;

                case REPO_STATE.UNSELECT:
                    if (this.sidebarButton) this.sidebarButton.innerHTML = this.name;
                    break;
            }
        }
    }
}
