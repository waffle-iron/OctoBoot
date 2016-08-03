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
        personal: boolean;
    }

    export class Templates {

        public data: Array<Template>;

        constructor(public projectName: string, public stage: Stage) {
            this.get_octoboot_template();
            this.get_personal_template();
        }

        public show(): void {
            new Alert({
                title: 'New Page',
                body: 'You can duplicate current file OR select new one from template list',
                icon: 'copy',
                onApproveText: 'DUPLICATE',
                onDenyText: 'TEMPLATE',
                onDenyClass: 'deny green',
                onDenyIcon: 'checkmark',
                closable: true,
                onApprove: () => this.duplicate(),
                onDeny: () => this.create_from_template()
            })
        }

        private duplicate(): void {
            var html: string, currentDepth: number = this.stage.url.split('/').length - 3;
            html = helper.Dom.formatDocumentToString(this.stage.iframe.contentDocument, currentDepth ? null : '../');

            // If we are already on a subfolder (subpage) we can copy/paste all the folder content
            // else, we are on the root folder and we can't simply copy/past root content so only copy index.html and format relative url
            this.enterFileName((name: string) => {
                var urls: string[] = this.stage.url.split('/')
                var file: string = urls.pop()

                if (currentDepth) {
                    var burl: string = this.stage.baseUrl.substr(1)

                    if (file.indexOf('.html') === -1) {
                        urls.push(file)
                    }
                    file = '*'
                    urls.push(file)
                    core.Socket.emit(model.ServerAPI.SOCKET_COPY, { src: burl + urls.join('/'), dest: burl + '/' + urls[1] + '/' + name + '/', file: '' }, (error: string) => {
                        if (error) {
                            new Alert({ title: 'Error on save', body: error, onApprove: () => { } })
                        } else {
                            this.stage.load('/' + urls[1] + '/' + name + '/index.html')
                        }
                    });

                } else {
                    core.Socket.emit(model.ServerAPI.SOCKET_SAVE, {
                        name: urls[1] + '/' + name,
                        content: html
                    }, (error: string) => {
                        if (error) {
                            new Alert({ title: 'Error on save', body: error, onApprove: () => { } })
                        } else {
                            this.stage.load('/' + urls[1] + '/' + name + '/index.html')
                        }
                    });
                }

            }, () => { }, null, this.stage.baseUrl + this.stage.url)
        }

        private create_from_template(): void {
            var dropdown: Array<string> = this.data.map((template) => { return template.name})
            var get_template: Function = (name: string): Template => {return this.data.filter((t: Template) => { return t.name === name })[0]}
            var alert: Alert = this.enterFileName((name: string) => {
                var tname: string = alert.getDropdownValue()
                this.createFileFromTemplate(name, tname, get_template(tname).personal)
            }, () => this.show(), null, this.data[0].iframe, dropdown)

            alert.jDom.find('.dropdown').dropdown({
                onChange: (value: string) => {
                    alert.jDom.find('iframe').attr('src', get_template(value).iframe)
                },
                fullTextSearch: true,
                match: 'text'
            })
        }

        private get_octoboot_template(done: () => any = () => {}): void {
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_TEMPLATE, null, (templateList: Array<string>) => {
                this.data = templateList.filter((name: string) => {
                    return !(name.indexOf('.') === 0)
                }).map((name: string) => {
                    return {
                        path: model.ServerAPI.getTemplatePath(name),
                        iframe: model.ServerAPI.getTemplatePath(name) + '/index.html',
                        name: name,
                        personal: false
                    }
                });
                done();
            });
        }

        private get_personal_template(done: () => any = () => {}): void {
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_DIR, { dir: core.Socket.sid + '/' + model.ServerAPI.TEMPLATE_REPO_NAME}, (templateList: Array<string>) => {
                if (templateList) {
                    var url: string;
                    var sup: Array<Template> = templateList.filter((name: string) => {
                        return !(name.indexOf('.') === 0)
                    }).map((name: string) => {
                        url = model.ServerAPI.getProjectPath(core.Socket.sid, model.ServerAPI.TEMPLATE_REPO_NAME) + name + '/index.html'
                        return {
                            path: model.ServerAPI.getProjectPath(core.Socket.sid, model.ServerAPI.TEMPLATE_REPO_NAME),
                            iframe: url,
                            name: name,
                            personal: true
                        }
                    });

                    this.data = sup.concat(this.data);
                }
                done();
            });
        }

        private enterFileName(done: (name: string) => any, deny: () => any, img?: string, iframe?: string, dropdown?: Array<string>): controllers.Alert {
            var alert: controllers.Alert = new Alert({
                title: dropdown ? 'Select a template and fill the name for your new page' : 'Fill the name for your new page',
                onApprove: () => done(alert.getInputValue().replace('.html', '')),
                onDeny: deny,
                image: img || null,
                iframe: iframe || null,
                dropdown: dropdown || null,
                input: this.stage.url.split('/').pop().replace(/\.html/ig, '')
            })
            return alert
        }

        private createFileFromTemplate(fileName: string, templateName: string, personal: boolean): void {
            core.Socket.emit(model.ServerAPI.SOCKET_COPY_TEMPLATE, { file: fileName, template: templateName, project: this.projectName, personal: personal }, () => {
                this.stage.load('/' + this.projectName + (fileName === 'index' ? '' : '/' + fileName ) + '/index.html');
            });
        }

    }
}
