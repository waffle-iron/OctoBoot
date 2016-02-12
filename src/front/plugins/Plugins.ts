/// <reference path="../controllers/Handlebar.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../core/Socket.ts" />

module OctoBoot {

    export class Plugin extends controllers.Handlebar {

        public handlers: model.HTMLEvent = {
            dragstart: () => this.stick(),
            dragend: () => this.unstick(),
            click: () => this.warndrag()
        }

        public container: JQuery;
        public stage: controllers.Stage;
        public projectName: string;

        // to override if needed
        public allowedTag: string = 'ARTICLE|DIV';

        private placeholder: JQuery;
        
        constructor(public name: string) {
            super(name)
        }

        public init(container: JQuery, stage: controllers.Stage, projectName: string) {
            this.container = container;
            this.stage = stage;
            this.projectName = projectName;
            this.placeholder = new controllers.Handlebar('Placeholder.hbs').initWithContext(null);
            this.placeholder.remove();

            return this.initWithContext(this, container)
        }

        // TO BE OVERRIDE ON YOUR PLUGIN
        public getInline(cbk: (plugin_html: string) => any): void {    
            cbk('')
        }

        public copyFileInProject(uri: string, done: () => any): void {
            core.Socket.emit(model.ServerAPI.SOCKET_COPY_PLUGIN, {
                file: uri,
                project: this.projectName
            }, (error: string) => {
                if (error) {
                    new controllers.Alert({title: 'Error on plugin creation', body: error, onApprove: () => {}})
                } else {
                    done()
                }
            })
        }

        private stick(): void {
            this.stage.iframe.contentWindow.ondragover = (e: DragEvent) => {
                var el: HTMLElement = e.target as HTMLElement;
                if (this.allowedTag.match(el.tagName.toUpperCase())) {
                    this.placeholder.appendTo(el)
                } else if (this.allowedTag.match(el.parentElement.tagName.toUpperCase())) {
                    this.placeholder.insertBefore(el)
                }
            }
        }

        private unstick(): void {
            if (this.placeholder.parent().length) {
                this.getInline((plugin_html: string) => {
                    this.placeholder.replaceWith(plugin_html)
                })
            }

            this.stage.iframe.contentWindow.ondragover = null;
        }

        private warndrag(): void {
            new controllers.Alert({
                title: 'Drag & Drop your plugin',
                body: 'You have to drag and drop the plugin (button) on your page',
                icon: 'move',
                onApprove: () => {}
            })
        }
    }
}