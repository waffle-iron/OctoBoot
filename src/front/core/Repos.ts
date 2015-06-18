/// <reference path="../controllers/Alert.ts" />

module GHBoot.core {

    export class Repos {

        constructor (public name: string, public url: string, type: string) {
            if (!name) {
                this.create(type);
            } else {
                this.select();
            }
        }

        private select(): void {
            this.convertRepoToGHBoot(() => {
                core.GitHub.cloneOnServer(this.url, (success: boolean) => {
                    if (success) {
                        // TODO WORK :D
                    } else {
                        // TODO trigger error
                    }
                });
            });
        }

        private convertRepoToGHBoot(done: () => any): void {
            var convert = true;
            core.GitHub.getTree(this.name, (dataTree: model.GitHubTree) => {
                dataTree.tree.forEach((value: model.GitHubTreeFile) => {
                    if (value.path.indexOf('.ghboot') !== -1) {
                        convert = false;
                    }
                });

                if (convert) {
                    new controllers.Alert(
                        'Not a GHBoot project',
                        'Sorry, it seems that your project are not a GHBoot project, did you want to convert it ?',
                        () => alert("toto"), true);
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
                        var name: string = $(this).get()[0].getElementsByTagName('input')[0].value;
                        core.GitHub.createRepo(name, type, __this.convertRepoToGHBoot.bind(__this, name));
                    }
                })
                .modal('show');
        }
    }
}
