/// <reference path="../controllers/Handlebar.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../core/Socket.ts" />

module OctoBoot {

    export enum PluginDragOverAction {
        APPEND,
        OVER
    }

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
        public dragOverAction: PluginDragOverAction = PluginDragOverAction.APPEND;

        public placeholder: JQuery;
        public currentElement: HTMLElement;
        
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

        public checkForLib(name: string, propToCheck: any, libToAppend: string[], done: () => any, deny: () => any): void {
            if (propToCheck) {
                done()
            } else {
                new controllers.Alert({
                    title: name + ' library needed',
                    body: name + ' library are not present in your template and this plugin need it, allow Octoboot to add ' + name + ' in your template ?',
                    onApprove: () => {
                        libToAppend.forEach((lib: string) => this.appendLib(lib))
                        done()
                    },
                    onDeny: deny
                })
            }
        }

        public appendLib(lib: string): void {
            let type: string = lib.split('.').pop(), sr: any;

            switch (type) {
                case 'js':
                    sr = document.createElement('script')
                    sr.src = lib
                    this.stage.iframe.contentDocument.head.appendChild(sr)
                    break

                case 'css':
                    sr = document.createElement('link')
                    sr.href = lib
                    sr.rel = 'stylesheet'
                    sr.type = 'text/css'
                    this.stage.iframe.contentDocument.head.appendChild(sr)
                    break
            }
        }

        private stick(): void {
            var prev: HTMLElement;
            this.stage.iframe.contentWindow.ondragover = (e: DragEvent) => {
                if (e.target === prev) {
                    return
                }
                prev = e.target as HTMLElement
                if (e.target !== this.placeholder.get(0)) {
                    switch (this.dragOverAction) {
                        case PluginDragOverAction.APPEND:
                            this.append(e)
                            break

                        case PluginDragOverAction.OVER:
                            this.over(e)
                            break
                    }
                }
            }
        }

        private append(e: DragEvent): void {
            let el: HTMLElement = e.target as HTMLElement;
            if (this.allowedTag.match(el.tagName.toUpperCase())) {
                this.currentElement = el;
                this.placeholder.appendTo(el)
            } else if (this.allowedTag.match(el.parentElement.tagName.toUpperCase())) {
                this.currentElement = el;
                this.placeholder.insertBefore(el)
            }
        }

        private over(e: DragEvent): void {
            let el: HTMLElement  = e.target as HTMLElement;
            if (this.allowedTag.match(el.tagName.toUpperCase())) {
                this.currentElement = el;

                let rect = el.getBoundingClientRect()
                let top = rect.top + $(this.stage.iframe.contentDocument).scrollTop()
                this.placeholder
                    .css(rect)
                    .css({
                        top: top,
                        position: 'absolute'
                    })
                    .appendTo(this.stage.iframe.contentDocument.body)
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