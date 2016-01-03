/// <reference path="Handlebar.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/ServerApi.ts" />
/// <reference path="../definition/jquery.plugin.d.ts" />

module OctoBoot.controllers {

    interface Template {
        path: string;
        min?: string;
        iframe?: string;
        name: string;
        event: model.HTMLEvent;
    }

    export class Templates extends Handlebar {

        public data: Array<Template>;   

        constructor(public projectName: string, public stage: Stage) {
            super(model.UI.HB_TEMPLATES);

            this.get_octoboot_template(() => {
                this.get_personal_template(() => this.initWithContext(this))
            });
        }

        public show(): void {
            this.jDom.modal('show');
        }

        private get_octoboot_template(done: () => any): void {
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_TEMPLATE, null, (templateList: Array<string>) => {
                this.data = templateList.filter((name: string) => {
                    return !(name.indexOf('.') === 0)
                }).map((name: string) => {
                    return { path: model.ServerAPI.getTemplatePath(name), min: 'min.jpg', name: name, event: this.event(name, model.ServerAPI.getTemplatePath(name) + 'min.jpg') }
                });
                done();
            });
        }

        private get_personal_template(done: () => any): void {
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_DIR, { dir: core.Socket.sid + '/' + model.ServerAPI.TEMPLATE_REPO_NAME}, (templateList: Array<string>) => {
                console.log(templateList);
                if (templateList) {
                    var url: string;
                    var sup: Array<Template> = templateList.filter((name: string) => {
                        return !(name.indexOf('.') === 0)
                    }).map((name: string) => {
                        url = model.ServerAPI.getProjectPath(core.Socket.sid, model.ServerAPI.TEMPLATE_REPO_NAME) + name + '/index.html'
                        return { 
                            path: model.ServerAPI.getProjectPath(core.Socket.sid, model.ServerAPI.TEMPLATE_REPO_NAME), 
                            iframe: name + '/index.html', 
                            name: name, 
                            event: this.event('../../temp/' + core.Socket.sid + '/' + model.ServerAPI.TEMPLATE_REPO_NAME + '/' + name, null, url) 
                        }
                    });

                    this.data = sup.concat(this.data);
                }
                done();
            });
        }

        private event(templateName: string, img? :string, iframe?: string): model.HTMLEvent {
            return {
                click: () => {
                    var alert: controllers.Alert = new Alert({
                        title: 'Enter a name for your file',
                        onApprove: () => this.createFileFromTemplate(alert.getInputValue(), templateName),
                        onDeny: () => this.show(),
                        image: img || null,
                        iframe: iframe || null,
                        input: this.stage.url.split('/').pop().replace(/\.html/ig, '')
                    });
                }
            }
        }

        private createFileFromTemplate(fileName: string, templateName: string): void {
            core.Socket.emit(model.ServerAPI.SOCKET_COPY, { file: fileName, template: templateName, project: this.projectName }, () => {
                this.stage.load('/' + this.projectName + '/' + fileName);
            });
        }

    }
}
