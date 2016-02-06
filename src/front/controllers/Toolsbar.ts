/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="EditBar.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../helper/Dom.ts" />

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        public templates: Templates;
        public editing: boolean;

        public createHandlers: model.HTMLEvent = {
            click: () => this.create()
        };

        public saveHandlers: model.HTMLEvent = {
            click: () => this.save()
        };

        public publishHandlers: model.HTMLEvent = {
            click: () => this.publish()
        };

        public editHandlers: model.HTMLEvent = {
            click: () => this.edit()
        };

        public uploadHandlers: model.HTMLEvent = {
            click: () => this.upload()
        };

        private editBarHover: EditBar;
        private editBarClick: EditBar;
        private inputUpload: HTMLInputElement;
        private fileReader: FileReader;

        constructor(public projectName: string, public stage: Stage, public repoUrl: string) {
            super(model.UI.HB_TOOLSBAR);
            this.initWithContext(this, this.stage.jDom);

            this.templates = new Templates(this.projectName, this.stage);

            $('.Sidebar').sidebar('attach events', this.jDom.children('.settings'));

            core.Socket.io.on('404', () => this.setItemActive('New'));
            core.Socket.io.on('save_available', () => this.setItemActive('save'));

            this.inputUpload = $('input#upload').get(0) as HTMLInputElement;
        }

        private create(): void {
			this.templates.show();
        }

        private save(): void {
            if (this.editing) {
                this.edit();
            }

            this.setIconLoading(['save']);

            var doc: Document = this.stage.iframe.contentDocument;

            var content: string = 
                doc.body.childElementCount === 1 && 
                doc.body.children[0].tagName.toUpperCase() === 'PRE' ?
                $(doc.body.children[0]).text() : new XMLSerializer().serializeToString(doc)

            content = content
                .replace(/(\sclass="")/, '') // clean html string from edition misc
                .replace(/\n\n\n/ig, ''); // remove extras linebreak

            var uri: string[] = this.stage.url.split('/');
            var file: string = uri.pop();

            core.Socket.emit(model.ServerAPI.SOCKET_SAVE, {
                name: uri.join('/'),
                url: this.repoUrl,
                content: content,
                file: file
            }, (error: string) => {
                if (error) {
                    new Alert({ title: 'Error on save', body: error, onApprove: () => {}})
                } else {
                    this.setItemActive('publish');
                }
                this.setIconLoading(['save'], false);
            });
        }

        private publish(): void {
            new Alert({
                title: model.UI.PUBLISH_ALERT_TITLE,
                body: model.UI.PUBLISH_ALERT_BODY,
                onApprove: () => {

                    this.setIconLoading(['cloud', 'upload']);

                    core.Socket.emit(model.ServerAPI.SOCKET_PUBLISH, { name: this.projectName, url: this.repoUrl }, () => {

                        this.setIconLoading(['cloud', 'upload'], false);

                        core.GitHub.getUser((user: model.GitHubUser) => {
                            new Alert({
                                title: 'Publish success !',
                                icon: 'checkmark',
                                link: 'http://' + user.login.toLowerCase() + '.github.io/' + this.projectName,
                                onApprove: () => {}
                            });
                        });
                    });
                },
                onDeny: () => {}
            })
        }

        private edit(): void {
            var container: JQuery = $(this.stage.iframe.contentDocument.body);

            // Bind events on window if not already done for editing
            this.bindEditionEvents();

            // Editing flag
            this.editing = !this.editing;

            if (this.editing) {
                // If editing, create or reset EditBar on click and hover (need two different EditBar)
                this.setItemActive('edit');
                this.editBarHover = new EditBar(container, this.stage);
                this.editBarClick = new EditBar(container, this.stage);
            } else {
                // If not editing, destroy EditBar
                this.setItemActive('null');
                this.editBarClick.destroy();
                this.editBarHover.destroy();
            }
        }

        private upload(): void {
            this.setIconLoading(['upload'], true);
            $(this.inputUpload).click();
            $(this.inputUpload).one('change', (e) => {
                this.fileReader = new FileReader();
                this.fileReader.readAsArrayBuffer(this.inputUpload.files[0])
                this.fileReader.onloadend = (e: any) => {
                    var xhr: XMLHttpRequest = new XMLHttpRequest()
                    xhr.open('POST', model.ServerAPI.UPLOAD
                            .replace(/:sid/, core.Socket.sid.toString())
                            .replace(/:project/, this.projectName)
                            .replace(/:filename/, this.inputUpload.files[0].name))
                    xhr.onloadend = () => {
                        this.setIconLoading(['upload'], false);
                    }
                    xhr.setRequestHeader('Content-Type', this.inputUpload.files[0].type);
                    xhr.send(e.target.result)
                }
            })
        }

        // TODO SEE TO MOVE THIS ON EDIT BAR
        private bindEditionEvents(): void {
            if (this.stage.iframe.contentWindow['editing']) {
                return
            }

            this.stage.iframe.contentWindow.addEventListener('mousemove', (e: MouseEvent) => {
                let element: HTMLElement = $(e.target).get(0);
                if (this.editing && !this.editBarClick.editingElement) {
                    // if we are in editing mode AND nothing currently editing
                    this.editBarHover.show(element, this.stage.iframe.contentDocument);
                }
            });

            var click = (e: JQueryEventObject) => {
                let element: HTMLElement = $(e.target).get(0);
                if (this.editing && !this.editBarClick.editingElement) {
                    // if we are in editing mode, and nothing currently in edition, active edit bar
                    this.editBarClick.show(element, this.stage.iframe.contentDocument);
                } else if (
                    // if we've not click on ckeditor
                    (!this.editBarClick.editor_dom || !helper.Dom.hasParent(element, this.editBarClick.editor_dom.get(0))) &&
                    // editing element either
                    !helper.Dom.hasParent(element, this.editBarClick.editingElement) &&
                    // and we click OUTSIDE our editing element
                    !helper.Dom.mouseIsOverElement(e.originalEvent as MouseEvent, this.editBarClick.editingElement)) {
                    // disable edit bar (so reactive on mousemove)
                    this.editBarClick.hide();
                    this.editBarHover.hide();
                }
            }

            $(this.stage.iframe.contentWindow).click(click)
            // prevent stage link to redirect when editing
            $(this.stage.iframe.contentDocument).on('click', 'a', (e: JQueryEventObject) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                click(e);
                return false;
            });

            // Editing flag for binded event
            this.stage.iframe.contentWindow['editing'] = true;
        }

        private setItemActive(wich: string): void {
            this.jDom.children('.item.active').removeClass('active');
            this.jDom.children('.item.' + wich).addClass('active');
        }

        private setIconLoading(wich: Array<string>, loading: boolean = true): void {
            this.jDom
                .find((loading ? '.' + wich.join('.') : '.spinner.loading') + '.icon')
                .removeClass(loading ? wich.join(' ') : 'spinner loading')
                .addClass(loading ? 'spinner loading' : wich.join(' '));
        }

    }
}
