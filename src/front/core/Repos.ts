/// <reference path="../controllers/Alert.ts" />

module OctoBoot.core {

    export class Repos {

        constructor (public name: string, public url: string, type: string) {
            if (!name) {
                this.create(type);
            } else {
                this.select();
            }
        }

        private select(): void {
            this.convertRepoToOctoBoot(() => {
                core.GitHub.cloneOnServer(this.url, (success: boolean) => {
                    if (success) {
                        // TODO WORK :D
                    } else {
                        // TODO trigger error
                    }
                });
            });
        }

        private convertRepoToOctoBoot(done: () => any): void {
            var convert = true;
            core.GitHub.getTree(this.name, (dataTree: model.GitHubTree) => {
                dataTree.tree.forEach((value: model.GitHubTreeFile) => {
                    if (value.path.indexOf('.octoboot') !== -1) {
                        convert = false;
                    }
                });

                if (convert) {
                    new controllers.Alert(
                        'Not a OctoBoot project',
                        'Sorry, it seems that your project are not a OctoBoot project, did you want to convert it ?',
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
                        core.GitHub.createRepo(name, type, __this.convertRepoToOctoBoot.bind(__this, name));
                    }
                })
                .modal('show');
        }
    }
}
