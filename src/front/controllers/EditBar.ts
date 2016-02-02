/// <reference path="Handlebar.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../definition/ckeditor.d.ts" />

module OctoBoot.controllers {

    export class EditBar extends Handlebar {

        // iframe container of EditingBar
        public iframe: Handlebar;
        public iframeBody: JQuery;

        // current editing element
        public editingElement: HTMLElement;
        public editingDocument: HTMLDocument;

        // text editor
        public editor: CKEDITOR.editor;
        public editor_dom: JQuery;

        // width and number of buttons on EditBar
        private buttonWidth: number = 35;
        private buttonNum: number = 8;

        // width / height and margin of global EditBar
        private width: number = (this.buttonWidth * this.buttonNum) + (this.buttonNum  * 2); // give some extra space for targeted tag (can be one letter like A but also SPAN etc..)
        private height: number = 150;
        private margin: number = 5;

        // lines who border the editing element
        private lines: { top: JQuery, bottom: JQuery, left: JQuery, right: JQuery };
        // extended editable
        private editable_extended = { span: 1, strong: 1 };
        // interval positioning
        private interval: number;
        // current position
        private rect: ClientRect;

        constructor(public container: JQuery) {
            super(model.UI.HB_EDITBAR);

            this.iframe = new Handlebar(model.UI.HB_EDITBAR_FRAME);
            this.iframe.initWithContext(this, container);

            var onLoad: (e?: Event) => void = (e: Event) => {
                var iframeDocument: JQuery = this.iframe.jDom.contents();
                this.iframeBody = iframeDocument.find('body');

                iframeDocument.find('head').append($.parseHTML(
                    '<link rel=\"stylesheet\" type=\"text/css\" href=\"/lib/semantic/dist/semantic.css\">' +
                    '<script src=\"lib/semantic/dist/semantic.min.js\"></script>'
                ));

                this.initWithContext(this.HBHandlers(this.iframeBody), this.iframeBody);

                // activate popup on edit button
                this.iframeBody.find('.button.topleft').popup({ inline: true, position: 'top left' });
                this.iframeBody.find('.button.topright').popup({ inline: true, position: 'top left' });

                this.iframeBody.css('background', 'none'); // semantic-ui put a *** background on body

                this.iframe.jDom.hide();
            }

            // Fix #16 - Check if Firefox, and if it is, fill iframe on load
            if (typeof window['InstallTrigger'] !== 'undefined') {
                this.iframe.jDom.on('load', onLoad);
            } else {
                onLoad();
            }

            // extend ckeditor editable because we do the positioning manually ;)
            jQuery.extend(CKEDITOR.dtd.$editable, this.editable_extended)
        }

        public show(element: HTMLElement, document: Document): void {
            if (element.getBoundingClientRect) {
                this.editingElement = element;
                this.editingDocument = document;

                // clean interval if already existing on other element
                // create interval and make manually the first call
                clearInterval(this.interval);
                this.interval = null;
                this.interval = setInterval(() => this.position(element, document), 500)
                this.position(element, document)

                this.appendSpecialButton(element);
            }
        }

        public hide(): void {
            clearInterval(this.interval);
            this.interval = null;

            this.iframe.jDom.hide();
            this.border(null);

            if (this.editingElement) {
                this.editingElement.removeAttribute('contentEditable');
            }

            this.editingElement = null;
            this.editingDocument = null;

            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }
        }

        public destroy(): void {
            this.hide();
            this.iframe.jDom.remove();
        }

        private position(element: HTMLElement, document: Document): void {
            var rect: ClientRect = this.getRect(element, document);

            if (JSON.stringify(this.rect) !== JSON.stringify(rect)) {
                var down: boolean = rect.top - this.height < 0;

                this.iframe.jDom.css({
                    'top': down ? rect.bottom : rect.top - this.height,
                    'left': rect.right - this.width
                }).show();

                this.border(rect);
                this.rect = rect;
            }
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

        private fillTagButton(element: Element): void {
            let button: JQuery = this.iframeBody.find('.button').last();
            // Fill button with current tag name
            button.html(element.tagName);
        }

        private appendSpecialButton(element: Element): void {
            this.iframeBody.find('.button.special').hide();

            // if it's an CKEDITOR editable element (text/div/etc)
            if (CKEDITOR.dtd.$editable[element.tagName.toLowerCase()]) {
                this.iframeBody.find('.special.ckeditor').show();
            }

            // fill tag button with element tag name
            this.fillTagButton(element);
        }

        private ckeditor(): void {
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
                this.editingElement.removeAttribute('contentEditable');
            } else {
                this.editingElement.contentEditable = 'true';
                this.editor = CKEDITOR.inline(this.editingElement);
                this.editingElement.focus();

                var position = (evt: CKEDITOR.eventInfo) => {
                    this.editor_dom = $('.cke');
                    var rect: ClientRect = this.getRect(this.editingElement, document);
                    var down: boolean = rect.top - this.editor_dom.height() < 0;

                    this.editor_dom.css({
                        'top': (down ? rect.bottom : rect.top - this.editor_dom.height()) + 35,
                        'left': Math.abs((rect.right - this.editor_dom.width()) - 52),
                        'position': 'absolute',
                        'right': ''
                    }).show();
                }

                // we need to manually positionning ckeditor instance when ready
                this.editor.on('instanceReady', position)
                // we need to cancel the editor focus event because they re position editor and we don't want that :)
                this.editor.on('focus', (evt: CKEDITOR.eventInfo) => evt.cancel())
            }

        }

        private HBHandlers(context: JQuery): any {
            return $.each({
                duplicate : {
                    click: () => this.duplicate()
                },
                remove : {
                    click: () => this.remove()
                },
                ckeditor: {
                    click: () => this.ckeditor()
                }
            }, (key: string, handlers: model.HTMLEvent) => handlers.context = context)
        }
    }
}
