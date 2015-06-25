/// <reference path="../controllers/Alert.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="Socket.ts" />

module OctoBoot.core {

    export class Repos {

        public stage: controllers.Stage;

        private alertConvert: controllers.Alert;

        constructor (public name: string, public url: string, type: string) {
            if (!name) {
                this.create(type);
            } else {
                this.select();
            }
        }

        private select(): void {
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
            core.GitHub.cloneOnServer(this.url, (success: boolean) => {
                if (success) {
                    var projectUrl: string = "/temp/" + SOCKET_ID + "/" + this.name + "/index.html";
                    if (convert) {
                        this.convertAndWait(() => {
                            this.stage = new controllers.Stage(projectUrl);
                        });
                    } else {
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
    }
}
