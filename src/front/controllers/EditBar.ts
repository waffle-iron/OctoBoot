/// <reference path="Handlebar.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../definition/aloha.d.ts" />

module OctoBoot.controllers {

    export class EditBar extends Handlebar {

        // iframe container of EditingBar
        public iframe: Handlebar;

        // width and number of buttons on EditBar
        private buttonWidth: number = 32;
        private buttonNum: number = 6;
        
        // width / height and margin of global EditBar
        private width: number = this.buttonWidth * this.buttonNum;
        private height: number = 100;
        private margin: number = 5;
        
        // current editing element
        private editingElement: Element;
        // callback called when a new element is append (eg duplicate)
        private cbkNewElement: Function;

        // lines who border the editing element
        private lines: { top: JQuery, bottom: JQuery, left: JQuery, right: JQuery };

        constructor(public container: JQuery) {
            super(model.UI.HB_EDITBAR);

            this.iframe = new Handlebar(model.UI.HB_EDITBAR_FRAME);
            this.iframe.initWithContext(this, container);

            var onLoad: (e?: Event) => void = (e: Event) => {
                var iframeDocument: JQuery = this.iframe.jDom.contents();
                var iframeBody: JQuery = iframeDocument.find('body');


                this.initWithContext(this.HBHandlers(iframeBody), iframeBody);
                
                // activate popup on edit button
                iframeBody.find('button.topleft').popup({inline: true}); 
                iframeBody.find('button.topright').popup({inline: true, position: 'top right'});

                iframeDocument.find('head').append($.parseHTML(
                    '<link rel=\"stylesheet\" type=\"text/css\" href=\"/lib/semantic/semantic.css\">' +
                    '<script src=\"lib/semantic/semantic.min.js\"></script>'
                ));
                iframeBody.css('background', 'none'); // semantic-ui put a *** background on body

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
            }
        }

        public hide(): void {
            this.iframe.jDom.hide();
            this.border(null);
        }

        public destroy(): void {
            this.iframe.jDom.remove();
            this.border(null);
        }

        public onNewElement(cbk: (newElement: JQuery) => any): void {
            this.cbkNewElement = cbk;
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
            this.cbkNewElement(duplicateElement);
        }

        private remove(): void {
            $(this.editingElement).remove();
            this.hide();
        }

        private HBHandlers(context: JQuery): any {
            return $.each({
                bold : {
                    click: aloha.ui.command(aloha.ui.commands.bold)
                },
                underline : {
                    click: aloha.ui.command(aloha.ui.commands.underline)
                },
                italic : {
                    click: aloha.ui.command(aloha.ui.commands.italic)
                },
                unformat : {
                    click: aloha.ui.command(aloha.ui.commands.unformat)
                },
                duplicate : {
                    click: () => this.duplicate()
                },
                remove : {
                    click: () => this.remove()
                }
            }, (key: string, handlers: model.HTMLEvent) => handlers.context = context)
        }
    }
}
