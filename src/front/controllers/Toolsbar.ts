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

        private editBarHover: EditBar;
        private editBarClick: EditBar;

        constructor(public projectName: string, public stage: Stage, public repoUrl: string) {
            super(model.UI.HB_TOOLSBAR);
            this.initWithContext(this, this.stage.jDom);

            this.templates = new Templates(this.projectName, this.stage);

            $('.Sidebar').sidebar('attach events', this.jDom.children('.settings'));

            core.Socket.io.on('404', () => this.setItemActive('New'));
            core.Socket.io.on('save_available', () => this.setItemActive('save'));
        }

        private create(): void {
			this.templates.show();
        }

        private save(): void {
            if (this.editing) {
                this.edit();
            }

            this.setIconLoading(['save']);

            var content: string = new XMLSerializer()
                .serializeToString(this.stage.iframe.contentDocument)
                .replace(/(\sclass="")/, "") // clean html string from edition misc
                .replace(/^\n$/, ""); // todo maybe remove this

            core.Socket.emit(model.ServerAPI.SOCKET_SAVE, { name: this.projectName, url: this.repoUrl, content: content, file: this.stage.url.replace(/\/$/, '').split('/').pop() }, () => {
                this.setIconLoading(['save'], false);
                this.setItemActive('publish');
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
                                link: 'http://' + user.name.toLowerCase() + '.github.io/' + this.projectName,
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
                this.editBarHover = new EditBar(container);
                this.editBarClick = new EditBar(container);
            } else {
                // If not editing, destroy EditBar
                this.setItemActive('null');
                this.editBarClick.destroy();
                this.editBarHover.destroy();
            }
        }

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
                } else if (!helper.Dom.hasParent(element, this.editBarClick.editingElement) &&
                    !helper.Dom.mouseIsOverElement(e.originalEvent as MouseEvent, this.editBarClick.editingElement)) {
                    // else if the click append outside the editing zone, disable edit bar (so reactive on mousemove)
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
