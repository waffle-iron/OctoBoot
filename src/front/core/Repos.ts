/// <reference path="../controllers/Alert.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="../controllers/Toolsbar.ts" />
/// <reference path="../definition/jquery.plugin.d.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/ServerApi.ts" />
/// <reference path="Socket.ts" />
/// <reference path="GitHub.ts" />

module OctoBoot.core {

    export enum REPO_STATE {
        LOADING,
        SELECT,
        UNSELECT
    }

    export class Repos {

        public stage: controllers.Stage;
        public onCreate: (name: string, url: string) => void;

        private toolsbar: controllers.Toolsbar;
        private alertConvert: controllers.Alert;
        private alertCreate: controllers.Alert;

        constructor (public name: string, public url: string, public type: string, public sidebar: JQuery, public sidebarButton?: HTMLElement) {
            if (!name) {
                this.create(type);
            } else {
                this.select();
            }
        }

        public destroy(): void {
            this.setState(REPO_STATE.UNSELECT);
            if (this.stage) {
                this.stage.destroy();
            }
        }

        private select(): void {
            this.setState(REPO_STATE.LOADING);
            this.didConvertRepoToOctoBoot((convert: boolean) => {

                if (convert) {
                    this.alertConvert = new controllers.Alert({
                        title: model.UI.REPO_ALERT_CONVERT_TITLE,
                        body: model.UI.REPO_ALERT_CONVERT_BODY,
                        onApprove: () => this.clone(convert),
                        onDeny: () => true
                    });
                } else {
                    this.clone(convert);
                }

            });
        }

        private open(url: string): void {
            if (this.alertCreate) {
                this.alertCreate.hide();
                this.alertCreate = null;
            }

            if (this.alertConvert) {
                this.alertConvert.hide();
                this.alertConvert = null;
            }

            this.setState(REPO_STATE.SELECT);
            this.stage = new controllers.Stage(url);
            this.toolsbar = new controllers.Toolsbar(this.name, this.stage, this.url, this.sidebar);
        }

        private didConvertRepoToOctoBoot(done: (convert: boolean) => any): void {
            var convert = true;
            core.GitHub.getTree(this.name, (dataTree: model.GitHubTree) => {
                dataTree.tree.forEach((value: model.GitHubTreeFile) => {
                    if (value.path.indexOf('.octoboot') !== -1) {
                        convert = false;
                    }
                });

                done(convert);
            });
        }

        private clone(convert: boolean): boolean {
            if (this.alertConvert) {
                this.alertConvert.setWait()
            }
            core.GitHub.cloneOnServer(this.name, this.url, (error: string) => {
                if (!error) {
                    var projectUrl: string = model.ServerAPI.getProjectPath(Socket.sid, this.name) + "index.html";
                    if (convert) {
                        this.convertAndWait(() => this.open(projectUrl));
                    } else {
                        this.open(projectUrl);
                    }
                } else {
                    new controllers.Alert({ title: 'Error during project creation / refresh', body: error, onApprove: Socket.reset})
                }
            });

            return false
        }

        private convertAndWait(done: () => any): void {
            Socket.emit(model.ServerAPI.SOCKET_CONVERT, {
                name: this.name,
                url: this.url
            }, (error: string) => {
                if (!error) {

                    if (this.alertConvert) {
                        this.alertConvert.hide();
                    }

                    done();
                } else {
                    new controllers.Alert({ title: 'Error during project convertion', body: error , onApprove: () => {}})
                }
            });
        }

        private create(type: string): void {
            this.alertCreate = new controllers.Alert({
                title: 'New Project',
                body: model.UI.REPO_ALERT_NEW_BODY,
                onApprove: () => {
                    this.alertCreate.setWait();
                    this.name = this.alertCreate.getInputValue();
                    core.GitHub.createRepo(this.name, (repo: model.GitHubRepo) => {
                        this.url = repo.clone_url;
                        this.clone(true);

                        if (this.onCreate) {
                            this.onCreate(this.name, this.url);
                        }
                    });
                    return false //don't close Alert right now, wait before clone and select
                },
                onDeny: () => true,
                icon: 'at',
                input: 'NewProject...'
            });
        }

        private setState(state: REPO_STATE): void {
            switch (state) {
                case REPO_STATE.LOADING:
                    if (this.sidebarButton) this.sidebarButton.innerHTML = this.name + ' <i class="spinner loading icon" > </i>';
                    break;

                case REPO_STATE.SELECT:
                    if (this.sidebarButton) this.sidebarButton.innerHTML = this.name + ' <i class="checkmark icon" > </i>';
                    this.sidebar.sidebar('toggle');
                    break;

                case REPO_STATE.UNSELECT:
                    if (this.sidebarButton) this.sidebarButton.innerHTML = this.name + ' <i class="trash icon" > </i>';
                    break;
            }
        }
    }
}
