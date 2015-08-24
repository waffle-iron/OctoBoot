/// <reference path="Handlebar.ts" />
/// <reference path="../model/UI.ts" />

module OctoBoot.controllers {

    export class EditBar extends Handlebar {

        public iframe: Handlebar;

        private width: number = 150;
        private height: number = 40;

        constructor(container: JQuery) {
            super(model.UI.HB_EDITBAR);

            this.iframe = new Handlebar(model.UI.HB_EDITBAR_FRAME);
            this.iframe.initWithContext(null, container);

            var iframeDocument: JQuery = this.iframe.jDom.contents();
            this.initWithContext(null, iframeDocument.find('body'));
            iframeDocument.find('head').append($.parseHTML(
                '<link rel=\"stylesheet\" type=\"text/css\" href=\"/lib/semantic/semantic.css\">' +
                '<script src=\"lib/semantic/semantic.min.js\"></script>'
            ));
            iframeDocument.find('body').css('background', 'none');
            this.iframe.jDom.hide();
        }

        public show(element: Element, document: Document): void {
            if (element.getBoundingClientRect) {
                var rect: ClientRect = element.getBoundingClientRect();
                this.iframe.jDom.css({
                    'top': rect.top - this.height + $(document).scrollTop(),
                    'left': rect.right - this.width
                }).show();
            }
        }

        public hide(): void {
            this.iframe.jDom.hide();
        }

        public destroy(): void {
            this.iframe.jDom.remove();
        }
    }
}
