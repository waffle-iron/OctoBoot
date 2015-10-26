/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="EditBar.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../definition/aloha.d.ts" />



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

        private editingElm: Element[] = [];
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
                .replace(/(\sclass="")/, ""); // clean html string from edition misc

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

            // Function call when we click on a editable element
            var click = (element: Element) => {
                if (this.editing) {
                    this.editingElm.push(aloha(element).elem);
                    this.editBarClick.show(element, this.stage.iframe.contentDocument);
                }
            }

            // Function call when hover in or out an editable element
            var hoverInOut = (hoverIn: boolean, element: JQuery) => {
                if (this.editing) {
                    element.css('cursor', hoverIn ? 'pointer' : '');

                    if (hoverIn) {
                        this.editBarHover.show(element.get(0), this.stage.iframe.contentDocument);
                    } else {
                        this.editBarHover.hide();
                    }
                }
            }

            // Init editable element (TODO need to improve targeted tag)
            if (!this.stage.iframe.contentWindow['editing']) {
                container.find('p,a,h1,h2,h3,h4,h5,span').each((i: number, elm: Element) => {
                    var element: JQuery = $(elm);
                    element.click(() => click(elm));
                    element.hover(() => hoverInOut(true, element), () => hoverInOut(false, element));
                });
                this.stage.iframe.contentWindow['editing'] = true;
            }

            // Editing flag
            this.editing = !this.editing;

            if (this.editing) {
                // If editing, create or reset EditBar on click and hover (need two different EditBar)
                this.setItemActive('edit');
                this.editBarHover = new EditBar(container);
                this.editBarClick = new EditBar(container);
                this.editBarClick.onNewElement((newElement: JQuery) => {
                    // Callback called when a new element is inserted on the stage (eg with duplicate)
                    newElement.click(() => click(newElement.get(0)));
                    newElement.hover(() => hoverInOut(true, newElement), () => hoverInOut(false, newElement));
                })
            } else {
                // If not editing, destroy EditBar
                this.setItemActive('null');
                this.editBarClick.destroy();
                this.editBarHover.destroy();

                // And unactive aloha on editable element if they are
                if (this.editingElm.length) {
                    this.editingElm.every((e: Element, i: number, a: Element[]) => {
                        aloha.mahalo(e);
                        return true
                    });
                    this.editingElm = [];
                }
            }
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
