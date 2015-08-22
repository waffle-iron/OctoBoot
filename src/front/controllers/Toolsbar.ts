/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../core/Socket.ts" />



module OctoBoot.controllers {

    declare var aloha: any;

    export class Toolsbar extends Handlebar {

        public templates: Templates;
        public editing: boolean;
        public editingElm: Element[] = [];

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
            var save: JQuery = this.jDom.find('.save.icon').removeClass('save').addClass('spinner loading');
            var content: string = new XMLSerializer().serializeToString(this.stage.iframe.contentDocument);
            this.setIconLoading(['save']);
            core.Socket.emit('save', { name: this.projectName, url: this.repoUrl, content: content, file: this.stage.url.split('/').pop() }, () => {
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

                    core.Socket.emit('publish', { name: this.projectName, url: this.repoUrl }, () => {

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
            var click = (elm: Element) => {
                if (this.editing) {
                    this.editingElm.push(aloha(elm).elem);
                }
            }

            var hoverInOut = (hoverIn: boolean, element: JQuery, previous?: number) => {
                if (this.editing) {
                    element.fadeTo(100, hoverIn ? 0.5 : (previous || 1));
                    element.css('cursor', hoverIn ? 'text' : 'auto');
                }
            }

            if (this.editing === undefined) {
                $(this.stage.iframe.contentDocument.body).find('p,a,h1,h2,h3,h4,h5,span').each((i: number, elm: Element) => {
                    var element: JQuery = $(elm);
                    var previous: string = element.css('opacity');
                    element.click(() => click(elm));
                    element.hover(() => hoverInOut(true, element), () => hoverInOut(false, element, parseFloat(previous)));
                });
            }

            this.editing = !this.editing;

            if (this.editing) {
                this.setItemActive('edit');
            } else {
                this.setItemActive('null');
                if (this.editingElm.length) {
                    this.editingElm.every((e: Element, i: number, a: Element[]) => {
                        console.log(e, a);
                        aloha.mahalo(e);
                        return true;
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
