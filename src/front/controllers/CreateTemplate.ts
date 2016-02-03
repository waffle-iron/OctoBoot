/// <reference path="Alert.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/ServerApi.ts" />
/// <reference path="../model/GitHubRepo.ts" />

module OctoBoot.controllers {

    export class CreateTemplate {

        private alert: Alert;

        constructor(public repo: model.GitHubRepo, private done: () => any) {
            this.alert = new Alert({
                title: 'Template url',
                onApprove: () => this.scrapp_template(),
                onDeny: () => { return true },
                icon: 'world',
                input: 'http://...'
            });
        }

        private scrapp_template(): boolean {
            this.alert.setWait();
            core.Socket.emit(model.ServerAPI.SOCKET_SCRAPP, { url: this.alert.getInputValue() }, (data: string) => {
                if (data) {
                    this.preview_template(data);
                    this.alert.hide();
                } else {
                    new Alert({ title: 'Error during template creation', body: 'error when scrapp the website', onApprove: () => {}})
                }
            })

            return false // do not close the modal
        }

        private preview_template(url: string): void {
            this.alert = new Alert({
                title: 'Preview - Set template name',
                onApprove: () => this.create_repo_template(),
                onDeny: () => { return true },
                iframe: url,
                input: 'name...'
            });
        }

        private create_repo_template(): boolean {
            this.alert.setWait();
            if (!this.repo) {
                // if not exist, create it
                core.GitHub.createRepo(model.ServerAPI.TEMPLATE_REPO_NAME, (repo: model.GitHubRepo) => {
                    this.repo = repo;
                    core.GitHub.cloneOnServer(this.repo.name, this.repo.clone_url, (error: string) => {
                        if (!error) {
                            this.fill_repo_template();
                        } else {
                            new Alert({ title: 'Error during template creation', body: error, onApprove: core.Socket.reset})
                        }
                    })
                })
            } else {
                this.fill_repo_template();
            }

            return false // do not close the modal
        }

        private fill_repo_template(): void {
            core.Socket.emit(model.ServerAPI.SOCKET_FILL_TEMPLATE, { file: this.alert.getInputValue(), repo_url: this.repo.clone_url }, (error: string) => {
                if (error) {
                    new Alert({ title: 'Error during template creation', body: error, onApprove: core.Socket.reset });
                } else {
                    this.alert.hide();
                    setTimeout(this.done, 1000); // wait a little for gh-api to be updated
                }
            })
        }

    }
}
