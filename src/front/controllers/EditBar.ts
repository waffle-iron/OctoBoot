/// <reference path="Handlebar.ts" />
/// <reference path="../model/UI.ts" />

module OctoBoot.controllers {

    export class EditBar extends Handlebar {

        public iframe: Handlebar;

        private width: number = 150;
        private height: number = 40;
        private margin: number = 5;

        private lines: { top: JQuery, bottom: JQuery, left: JQuery, right: JQuery };

        constructor(public container: JQuery) {
            super(model.UI.HB_EDITBAR);

            this.iframe = new Handlebar(model.UI.HB_EDITBAR_FRAME);
            this.iframe.initWithContext(null, container);

            var iframeDocument: JQuery = this.iframe.jDom.contents();
            this.initWithContext(null, iframeDocument.find('body'));
            iframeDocument.find('head').append($.parseHTML(
                '<link rel=\"stylesheet\" type=\"text/css\" href=\"/lib/semantic/semantic.css\">' +
                '<script src=\"lib/semantic/semantic.min.js\"></script>'
            ));
            iframeDocument.find('body').css('background', 'none'); // semantic-ui put a *** background on body
            this.iframe.jDom.hide();
        }

        public show(element: Element, document: Document): void {
            if (element.getBoundingClientRect) {
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
    }
}
