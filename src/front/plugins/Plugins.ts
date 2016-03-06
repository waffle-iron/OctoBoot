/// <reference path="../controllers/Handlebar.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="../controllers/Borders.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../core/Socket.ts" />

interface Window {
    OctoBoot_plugins: any;
    eval: (str: string) => any;
}

module OctoBoot {

    interface CheckForLibOptions { name: string, propToCheck: string | boolean, libToAppend: string[], done: () => any, deny: () => any, copyFilesInProject?: string[] }

    export enum PluginDragOverAction {
        APPEND,
        OVER,
        BORDER
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
        public borders: controllers.Borders;
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
        // CALLED WHEN PLUGIN HAVE TO BE INSERTED ON PAGE
        public getInline(cbk: (plugin_html: string) => any): void {    
            cbk('')
        }

        // TO BE OVERRIDE ON YOUR PLUGIN
        // CALLED WHEN WE ARE OVER AN ALLOWED ELEMENT
        // USEFULL TO CHECK IF WE ARE OVER AN ALREADY INSERTED 
        // PLUGIN AND SO REMOVE AND MODIFY IT
        public filterElement(el: HTMLElement, cbk: () => any): void {
            cbk()
        }

        // COPY PLUGIN NEEDED RESSOURCE ON USER PROJECT
        // LIKE JS, HTML, ETC..
        public copyFileInProject(uri: string, done: () => any): void {
            core.Socket.emit(model.ServerAPI.SOCKET_COPY_PLUGIN, {
                file: uri,
                project: this.projectName
            }, (error: string) => {
                if (error) {
                    new controllers.Alert({title: 'Error on plugin creation', body: error, onApprove: () => {}})
                    this.placeholder.remove()
                } else if (done) {
                    done()
                }
            })
        }

        // CHECK IF A PARTICULAR LIBRARY ARE ON USER PAGE
        // AND IF NOT, GIVE USER CHOICE TO APPEND IT
        public checkForLib(options: CheckForLibOptions): void {
            if (typeof options.propToCheck === "boolean" && options.propToCheck) {
                options.done()
            } else if (this.stage.iframe.contentWindow.OctoBoot_plugins && 
                this.stage.iframe.contentWindow.OctoBoot_plugins[options.propToCheck as string]) {
                options.done()
            } else {
                new controllers.Alert({
                    title: options.name + ' library needed',
                    body: options.name + ' library are not present in your template and this plugin need it, allow Octoboot to add ' + options.name + ' in your template ?',
                    icon: 'book',
                    onApprove: () => {
                        if (options.copyFilesInProject) {
                            let tocopie: number = options.copyFilesInProject.length;
                            options.copyFilesInProject.forEach((file: string) => {
                                this.copyFileInProject(file, () => {
                                    tocopie--;
                                    if (!tocopie) {
                                        options.libToAppend.forEach((lib: string) => this.appendLib(lib))
                                        options.done()
                                    }
                                })
                            })
                        } else {
                            options.libToAppend.forEach((lib: string) => this.appendLib(lib))
                            options.done()
                        }
                    },
                    onDeny: options.deny
                })
            }
        }

        // APPEND LIBRARY (CSS / JS) ON USER PAGE
        public appendLib(lib: string): void {
            let type: string = lib.split('.').pop(), sr: any;

            lib = this.stage.applyRelativeDepthOnUrl(lib);

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

                        case PluginDragOverAction.BORDER:
                            this.border(e)
                            break
                    }
                }
            }
        }

        private append(e: DragEvent): void {
            this.allowed(e, (el: HTMLElement, parent: boolean) => {
                if (!parent) {
                    this.placeholder.appendTo(el)
                } else {
                    this.placeholder.insertBefore(el)
                }
            })
        }

        private over(e: DragEvent): void {
            this.allowed(e, (el: HTMLElement, parent: boolean) => {
                let rect = el.getBoundingClientRect()
                let top = rect.top + $(this.stage.iframe.contentDocument).scrollTop()
                this.placeholder
                    .css(rect)
                    .css({
                        top: top,
                        position: 'absolute'
                    })
                    .appendTo(this.stage.iframe.contentDocument.body)
            }, false)
        }

        private border(e: DragEvent): void {
            this.allowed(e, (el: HTMLElement, parent: boolean) => {
                if (this.borders) {
                    this.borders.destroy()
                }
                this.currentElement = parent ? el.parentElement : el;
                this.borders = new controllers.Borders(parent ? el.parentElement : el);
            })
        }

        private unstick(): void {
            if (this.placeholder.parent().length || this.borders) {
                this.filterElement(this.currentElement, () => {
                    this.getInline((plugin_html: string) => {
                        if (this.dragOverAction === PluginDragOverAction.BORDER) {
                            $(this.currentElement).append(plugin_html)
                        } else {
                            /** PROXY EVAL - If not, jquery will eval script on top window context, **/
                            let old_eval = eval;
                            window.eval = this.stage.iframe.contentWindow.eval;

                            this.placeholder.replaceWith(plugin_html)
                            window.eval = old_eval;
                        }
                    })
                })
            }

            this.stage.iframe.contentWindow.ondragover = null;
        }

        private allowed(e: DragEvent, cbk: (el: HTMLElement, parent: boolean) => any, parentAllowed: boolean = true): void {
            let el: HTMLElement = e.target as HTMLElement;
            if (this.allowedTag.match(el.tagName.toUpperCase())) {
                this.currentElement = el;
                cbk(el, false)
            } else if (parentAllowed && this.allowedTag.match(el.parentElement.tagName.toUpperCase())) {
                this.currentElement = el;
                cbk(el, true)
            }
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