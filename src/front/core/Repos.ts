/// <reference path="../controllers/Alert.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="Socket.ts" />

module OctoBoot.core {

    export enum REPO_STATE {
        LOADING,
        SELECT,
        UNSELECT
    }

    export class Repos {

        public stage: controllers.Stage;

        private alertConvert: controllers.Alert;

        constructor (public name: string, public url: string, public type: string, public sidebarButton?: HTMLElement) {
            if (!name) {
                this.create(type);
            } else {
                this.select();
            }
        }

        public destroy(): void {
            this.setState(REPO_STATE.UNSELECT);
            this.stage.destroy();
        }

        private select(): void {
            this.setState(REPO_STATE.LOADING);
            this.didConvertRepoToOctoBoot((convert: boolean) => {

                if (convert) {
                    this.alertConvert = new controllers.Alert(
                        model.UI.REPO_ALERT_CONVERT_TITLE,
                        model.UI.REPO_ALERT_CONVERT_BODY,
                        () => this.clone(convert), true);
                } else {
                    this.clone(convert);
                }

            });
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
            core.GitHub.cloneOnServer(this.name, this.url, (success: boolean) => {
                if (success) {
                    var projectUrl: string = "/temp/" + SOCKET_ID + "/" + this.name + "/index.html";
                    if (convert) {
                        this.convertAndWait(() => {
                            this.setState(REPO_STATE.SELECT);
                            this.stage = new controllers.Stage(projectUrl);
                        });
                    } else {
                        this.setState(REPO_STATE.SELECT);
                        this.stage = new controllers.Stage(projectUrl);
                    }
                } else {
                    // TODO trigger error
                }
            });

            return false
        }

        private convertAndWait(done: () => any): void {
            Socket.io.emit('convert', {
                name: this.name,
                url: this.url,
                sid: SOCKET_ID
            });

            Socket.io.once('converted', (success: boolean) => {
                if (success) {

                    if (this.alertConvert) {
                        this.alertConvert.hide();
                    }

                    done();
                } else {
                    // TODO ERROR ON ALERT
                    alert('error');
                }
            });
        }

        private create(type: string): void {
            var __this = this;
            // TODO See to use controller Alert for this
            $(document.body)
                .append(Handlebars.templates[model.UI.HB_NEW_REPO](null));
            $(helper.HandlebarHelper.formatId(model.UI.HB_NEW_REPO, '.'))
                .modal(<any>{
                    onApprove: function() {
                        __this.name = $(this).get()[0].getElementsByTagName('input')[0].value;
                        core.GitHub.createRepo(__this.name, type, (repo: model.GitHubRepo) => {
                            __this.url = repo.clone_url;
                            __this.clone.bind(__this)(true);
                        });
                    }
                })
                .modal('show');
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
