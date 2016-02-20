/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />
/// <reference path="../../helper/Dom.ts" />

interface Window {
    showmore?: (el: HTMLElement) => any;
}

module OctoBoot.plugins {

    export class Showmore extends Plugin {

        public allowedTag: string = 'ARTICLE|DIV';
        public dragOverAction: PluginDragOverAction = PluginDragOverAction.BORDER;

        private libShowmore: string = 'module/show.more.js';
        private libJQuery: string[] = ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js'];
        private libSemantic: string[] = [
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.css'
        ]

        private mask: JQuery;
        private content: JQuery;
        private button: JQuery;

        private coef: number = 0;
        private timeoutCoef: number;

        constructor() {
            super('ShowmoreButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {
            let w: Window = this.stage.iframe.contentWindow;
            let d: Document = this.stage.iframe.contentDocument;

            this.checkForLib('jQuery', w.$, this.libJQuery, () => {

                this.checkForLib('Semantic', w.$(d.body).accordion, this.libSemantic, () => {
                    
                    this.addPlugin(cbk)

                }, () => cbk(''))

            }, () => cbk(''))
        }

        public filterElement(el: HTMLElement, cbk: () => any): void {
            if ($(el).hasClass('showmore')) {
                new controllers.Alert({
                    title: 'Plugin Show More - Already Exist!',
                    body: 'Plugin Show More already exist on this element, click on OK to REMOVE it, or click on CANCEL to RESIZE it',
                    onApprove: () => {
                        this.getPluginDom(this.setShowmoreParentAsCurrentElement(el));
                        this.cancel();
                    },
                    onDeny: () => {
                        this.setShowmoreParentAsCurrentElement(el);
                        this.getPluginDom($(this.currentElement));
                        $(this.currentElement).css('transition', '');
                        this.mask.css('transition', '');
                        this.borders.element = this.currentElement;
                        this.borders.refresh();
                        cbk();
                    }
                })
            } else {
                cbk();
            }
        }

        private addPlugin(cbk: (plugin_html: string) => any): void {
            new controllers.Alert({
                title: 'Plugin Show more',
                body: 'Use your keyboard arrow UP and DOWN to set element\'s height, ENTER to confirm or ESCAPE to leave',
                icon: 'keyboard',
                closable: false,
                onApprove: () => {

                    let el: JQuery = $(this.currentElement);

                    if (!el.children('.showmore').length) {
                        this.setInline(el);
                    } else {
                        this.getPluginDom(el);
                    }

                    this.bindKeydown();
                },
                onDeny: () => { this.borders.destroy() }
            })
        }

        private setInline(el: JQuery): void {
            let content: JQuery = el.contents();
            new controllers.Handlebar('ShowmoreInline.hbs').initWithContext({}, el);
            this.getPluginDom(el);
            content.appendTo(this.content);
            let height: number = el.height();
            el.css('height', height + this.button.height())
        }

        private bindKeydown(): void {
            $(this.stage.iframe.contentDocument).keydown((e: JQueryKeyEventObject) => this.resize(e))
            $(this.stage.iframe.contentWindow).focus();
            this.borders.refresh();
        }

        private getPluginDom(el: JQuery): void {
            this.content = el.find('.showmore.sm_content');
            this.mask = el.find('.showmore.sm_mask');
            this.button = el.find('.showmore.sm_button');
        }

        private resize(e: JQueryKeyEventObject): void {
            e.originalEvent.preventDefault()
            console.log(e.keyCode)

            this.coef++;
            clearTimeout(this.timeoutCoef);
            this.timeoutCoef = setTimeout(() => this.coef = 0, 200);
            console.log(this.coef)
            switch (e.keyCode) {

                case 38: case 40:
                    let hi: number = this.mask.height();
                    let h: number = e.keyCode === 38 ? hi - this.coef : hi + this.coef;
                    $(this.currentElement).css('height', h + (this.button.height() * 2));
                    this.mask.css('height', h);
                    this.borders.refresh();
                    break

                case 13:
                    this.copyFileInProject('showmore/show.more.js', () => {
                        this.checkForLib('Show More', this.stage.iframe.contentWindow.showmore, [this.libShowmore], () => {
                            this.button.attr('onclick', 'showmore(this)');
                            $(this.currentElement).css('min-height', $(this.currentElement).css('height'));
                            $(this.currentElement).css('transition', 'height 1s ease-in-out');
                            this.mask.css('transition', 'height 1s ease-in-out');
                            this.borders.destroy();
                            $(this.stage.iframe.contentDocument).off('keydown');
                        }, () => this.cancel())
                    });
                    break

                case 27:
                    this.cancel()
                    break

                default:
                    new controllers.Alert({
                        title: 'Plugin Show More',
                        body: 'Only four keys are allowed, UP and DOWN to resize, ENTER to confirm and ESCAPE to cancel',
                        onApprove: () => {}
                    })
                    break
            }
        }

        private cancel(): void {
            $(this.stage.iframe.contentDocument).off('keydown');
            this.borders.destroy();
            $(this.currentElement).append(this.content.contents());
            $(this.currentElement).css('height', '');
            this.mask.remove();
            this.button.remove();
        }

        private setShowmoreParentAsCurrentElement(el: HTMLElement): JQuery {
            let elm: JQuery = $(el);
            while (elm.hasClass('showmore')) {
                elm = elm.parent()
            }
            this.currentElement = elm.get(0);
            return elm;
        }

    }
}