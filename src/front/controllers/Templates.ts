/// <reference path="Handlebar.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/ServerAPI.ts" />
/// <reference path="../definition/jquery.plugin.d.ts" />

module OctoBoot.controllers {

    interface Template {
        path: string;
        min: string;
        name: string;
        event: model.HTMLEvent;
    }

    export class Templates extends Handlebar {

        public data: Array<Template>;   

        constructor(public projectName: string, public stage: Stage) {
            super(model.UI.HB_TEMPLATES);

            core.Socket.emit(model.ServerAPI.SOCKET_LIST_TEMPLATE, null, (templateList: Array<string>) => {
                this.data = templateList.filter((name: string) => {
                    return !(name.indexOf('.') === 0)
                }).map((name: string) => {
                    return { path: model.ServerAPI.getTemplatePath(name), min: 'min.jpg', name: name , event: this.event(name)}
                });
                this.initWithContext(this);
            });
        }

        public show(): void {
            this.jDom.modal('show');
        }

        private event(templateName: string): model.HTMLEvent {
            return {
                click: () => {
                    var alert: controllers.Alert = new Alert({
                        title: 'Enter a name for your file',
                        onApprove: () => this.createFileFromTemplate(alert.getInputValue(), templateName),
                        onDeny: () => this.show(),
                        image: model.ServerAPI.getTemplatePath(templateName) + 'min.jpg',
                        input: this.stage.url.split('/').pop().replace(/\.html/ig, '')
                    });
                }
            }
        }

        private createFileFromTemplate(fileName: string, templateName: string): void {
            core.Socket.emit(model.ServerAPI.SOCKET_COPY, { file: fileName, template: templateName, project: this.projectName }, () => this.stage.reload());
        }

    }
}
