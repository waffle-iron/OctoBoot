/// <reference path="../definition/jquery.d.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Borders {

        // lines who border the editing element
        private lines: { top: JQuery, bottom: JQuery, left: JQuery, right: JQuery };
        private interval: number;
        private storeRect: ClientRect;

        constructor(public element: HTMLElement, public stick: boolean = false) {
            this.border(Borders.rect(element));

            if (stick) {
                this.interval = setInterval(() => this.refresh(), 100)
            }
        }

        static rect(element: HTMLElement, margin: number = 5, doc?: Document): ClientRect {
            var rect: ClientRect = element.getBoundingClientRect();
            return {
                top: rect.top + $(doc || element.ownerDocument).scrollTop() - margin,
                left: rect.left - margin,
                bottom: rect.bottom + $(doc || element.ownerDocument).scrollTop() + margin,
                right: rect.right + margin,
                width: rect.width + (margin * 2),
                height: rect.height + (margin * 2)
            }
        }

        public border(rect: ClientRect): void {
            var c: JQuery = $(this.element.ownerDocument.body);
            
            this.destroy();

            this.lines = {
                top: new Handlebar(model.UI.HB_HORIZONTAL_LINE).initWithContext(rect, c),
                bottom: new Handlebar(model.UI.HB_HORIZONTAL_LINE).initWithContext({ top: rect.bottom, left: rect.left, width: rect.width }, c),
                left: new Handlebar(model.UI.HB_VERTICAL_LINE).initWithContext(rect, c),
                right: new Handlebar(model.UI.HB_VERTICAL_LINE).initWithContext({ left: rect.right, top: rect.top, height: rect.height }, c)
            }
        }

        public destroy(): void {
            if (this.lines) {
                jQuery.each(this.lines, (i: number, elm: JQuery) => elm.remove());
                this.lines = null;
            }
        }

        public refresh(): void {
            var rect: ClientRect = Borders.rect(this.element);

            if (JSON.stringify(this.storeRect) !== JSON.stringify(rect)) {
                this.storeRect = rect;
                this.border(rect);
            }
        }

    }
}