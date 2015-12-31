/// <reference path="Alert.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/ServerApi.ts" />

module OctoBoot.controllers {

    export class CreateTemplate {

        public static NAME_REPO_TEMPLATE: string = 'OctoBoot-templates'

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
                this.alert.hide();
                if (data) {
                    this.preview_template(data);
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
            if (!this.repo) {
                // if not exist, create it
                core.GitHub.createRepo(CreateTemplate.NAME_REPO_TEMPLATE, (repo: model.GitHubRepo) => {
                    this.repo = repo;
                    core.GitHub.cloneOnServer(this.repo.name, this.repo.clone_url, (success: boolean) => {
                        if (success) {
                            this.fill_repo_template();
                        }
                    })
                })
            } else {
                this.fill_repo_template();
            }

            return false // do not close the modal
        }

        private fill_repo_template(): void {

        }

    }
}
