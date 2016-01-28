/// <reference path="Handlebar.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../definition/aloha.d.ts" />

module OctoBoot.controllers {

    export class EditBar extends Handlebar {

        // iframe container of EditingBar
        public iframe: Handlebar;
        public iframeBody: JQuery;

        // current editing element
        public editingElement: Element;

        // width and number of buttons on EditBar
        private buttonWidth: number = 35;
        private buttonNum: number = 8;

        // width / height and margin of global EditBar
        private width: number = (this.buttonWidth * this.buttonNum) + (this.buttonNum  * 2); // give some extra space for targeted tag (can be one letter like A but also SPAN etc..)
        private height: number = 34;
        private margin: number = 5;

        // lines who border the editing element
        private lines: { top: JQuery, bottom: JQuery, left: JQuery, right: JQuery };

        constructor(public container: JQuery) {
            super(model.UI.HB_EDITBAR);

            this.iframe = new Handlebar(model.UI.HB_EDITBAR_FRAME);
            this.iframe.initWithContext(this, container);

            var onLoad: (e?: Event) => void = (e: Event) => {
                var iframeDocument: JQuery = this.iframe.jDom.contents();
                this.iframeBody = iframeDocument.find('body');


                this.initWithContext(this.HBHandlers(this.iframeBody), this.iframeBody);

                // activate popup on edit button
                this.iframeBody.find('.button.topleft').popup({inline: true});
                this.iframeBody.find('.button.topright').popup({inline: true, position: 'top right'});

                // activate dropdown on tag
                this.iframeBody.find('.ui.dropdown').dropdown({
                    direction: 'upward',
                    on: 'hover',
                    action: 'hide',
                    onChange: (value: string, text: string, selectedItem: JQuery) => this.link(text, value, selectedItem)
                });

                iframeDocument.find('head').append($.parseHTML(
                    '<link rel=\"stylesheet\" type=\"text/css\" href=\"/lib/semantic/dist/semantic.css\">' +
                    '<script src=\"lib/semantic/dist/semantic.min.js\"></script>'
                ));
                this.iframeBody.css('background', 'none'); // semantic-ui put a *** background on body

                this.iframe.jDom.hide();
            }

            // Fix #16 - Check if Firefox, and if it is, fill iframe on load
            if (typeof window['InstallTrigger'] !== 'undefined') {
                this.iframe.jDom.on('load', onLoad);
            } else {
                onLoad();
            }
        }

        public show(element: Element, document: Document): void {
            if (element.getBoundingClientRect) {
                this.editingElement = element;

                var rect: ClientRect = this.getRect(element, document);
                var down: boolean = rect.top - this.height < 0;

                this.iframe.jDom.css({
                    'top': down ? rect.bottom : rect.top - this.height,
                    'left': rect.right - this.width
                }).show();
                this.border(rect);
                this.fillTagButton(element);
                this.appendSpecialButton(element);
            }
        }

        public hide(): void {
            this.iframe.jDom.hide();
            this.border(null);
            this.editingElement = null;
        }

        public destroy(): void {
            this.hide();
            this.iframe.jDom.remove();
        }

        private border(rect: ClientRect): void {
            if (this.lines) {
                jQuery.each(this.lines, (i: number, elm: JQuery) => elm.remove());
            }

            if (rect) {
                this.lines = {
                    top: new Handlebar(model.UI.HB_HORIZONTAL_LINE).initWithContext(rect, this.container),
                    bottom: new Handlebar(model.UI.HB_HORIZONTAL_LINE).initWithContext({ top: rect.bottom, left: rect.left, width: rect.width }, this.container),
                    left: new Handlebar(model.UI.HB_VERTICAL_LINE).initWithContext(rect, this.container),
                    right: new Handlebar(model.UI.HB_VERTICAL_LINE).initWithContext({ left: rect.right, top: rect.top, height: rect.height }, this.container)
                }
            }
        }

        private getRect(element: Element, document: Document): ClientRect {
            var rect: ClientRect = element.getBoundingClientRect();
            return {
                top: rect.top + $(document).scrollTop() - this.margin,
                left: rect.left - this.margin,
                bottom: rect.bottom + $(document).scrollTop() + this.margin,
                right: rect.right + this.margin,
                width: rect.width + (this.margin * 2),
                height: rect.height + (this.margin * 2)
            }
        }

        private duplicate(): void {
            var duplicateElement: JQuery = $(this.editingElement).clone();
            duplicateElement.insertAfter(this.editingElement);
        }

        private remove(): void {
            $(this.editingElement).remove();
            this.hide();
        }

        private link(text: string, value: string, selectedItem: JQuery): void {

        }

        private fillTagButton(element: Element): void {
            let button: JQuery = this.iframeBody.find('.button').last();
            // Fill button with current tag name
            button.html(element.tagName);
        }

        private appendSpecialButton(element: Element): void {
            this.iframeBody.find('.button.special').hide();

            switch (element.tagName.toUpperCase()) {

                case 'A':
                    //this.appendLinkButton(element as HTMLAnchorElement);
                    this.iframeBody.find('.special.link').show();
                    break
            }
        }

        /*private appendLinkButton(link: HTMLAnchorElement): void {

        }*/

        private HBHandlers(context: JQuery): any {
            return $.each({
                bold : {
                    //click: aloha.ui.command(aloha.ui.commands.bold)
                },
                underline : {
                    //click: aloha.ui.command(aloha.ui.commands.underline)
                },
                italic : {
                    //click: aloha.ui.command(aloha.ui.commands.italic)
                },
                unformat : {
                    //click: aloha.ui.command(aloha.ui.commands.unformat)
                },
                duplicate : {
                    //click: () => this.duplicate()
                },
                remove : {
                    //click: () => this.remove()
                }
            }, (key: string, handlers: model.HTMLEvent) => handlers.context = context)
        }
    }
}
