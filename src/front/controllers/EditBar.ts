/// <reference path="Handlebar.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="Borders.ts" />
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

        // text editor
        public editor: CKEDITOR.editor;
        public editor_dom: JQuery;

        // width and number of buttons on EditBar
        private buttonWidth: number = 35;
        private buttonNum: number = 8;

        // width / height and margin of global EditBar
        private width: number = (this.buttonWidth * this.buttonNum) + (this.buttonNum  * 2); // give some extra space for targeted tag (can be one letter like A but also SPAN etc..)
        private height: number = 80;
        private margin: number = 5;

        // lines who border the editing element
        private borders: Borders;
        // extended editable
        private editable_extended = { span: 1, strong: 1, li: 1, u: 1 };
        // extended ignored element
        private ignored_extended = { span: 0, strong: 0, b: 0, u: 0, i: 0 };
        // interval positioning
        private interval: number;
        // current position
        private rect: ClientRect;
        // iframe edition overlay
        private iframes_overlay: JQuery[];

        constructor(public container: JQuery, public stage: Stage) {
            super(model.UI.HB_EDITBAR);

            this.iframe = new Handlebar(model.UI.HB_EDITBAR_FRAME);
            this.iframe.initWithContext(this, container);

            var onLoad: (e?: Event) => void = (e: Event) => {
                var iframeDocument: JQuery = this.iframe.jDom.contents();
                this.iframeBody = iframeDocument.find('body');

                iframeDocument.find('head').append($.parseHTML(
                    '<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.css\">' +
                    '<script src=\"https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.js\"></script>'
                ));

                this.initWithContext(this.HBHandlers(this.iframeBody), this.iframeBody);

                // activate popup on edit button
                this.iframeBody.find('.button.topleft').popup({ inline: true, position: 'top left' });
                this.iframeBody.find('.button.topright').popup({ inline: true, position: 'top right' });

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
            jQuery.extend(CKEDITOR.dtd.$removeEmpty, this.ignored_extended)
            CKEDITOR.config.allowedContent = true
        }

        // we can't handle mouseover and click on iframe, and subframe etc..
        // so put an overlay over it with related iframe on overlay's data to handle properly
        public init_iframes_overlay(): void {
            this.remove_iframe_overlay();

            this.iframes_overlay = [];
            this.container.find('iframe').each((i: number, iframe: HTMLIFrameElement) => {
                this.iframes_overlay.push(
                    new Handlebar(model.UI.HB_EDITBAR_IFRAME_OVERLAY)
                    .initWithContext(Borders.rect(iframe), this.container)
                    .data('referer', iframe)
                )
            })
        }

        /**
        *    Show EditBar
        */

        public show(element: HTMLElement): void {
            // if we are over iframe_overlay, get related iframe element, else keep it
            element = this.is_iframe_overlay(element)

            if (element.getBoundingClientRect) {
                this.editingElement = element;

                // clean interval if already existing on other element
                // create interval and make manually the first call
                clearInterval(this.interval);
                this.interval = null;
                this.interval = setInterval(() => this.position(element), 100)
                this.position(element)

                this.appendSpecialButton(element);
            }
        }

        /**
        *    Hide EditBar
        */

        public hide(): void {
            clearInterval(this.interval);
            this.interval = null;
            this.rect = null;

            this.iframe.jDom.hide();
            
            if (this.borders) {
                this.borders.destroy();
            }

            if (this.editingElement) {
                this.editingElement.removeAttribute('contentEditable');
                $(this.stage.iframe.contentDocument).off('keydown');
            }

            this.editingElement = null;

            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }
        }

        /**
        *    Destroy EditBar
        */

        public destroy(): void {
            this.hide();
            this.iframe.jDom.remove();
            this.remove_iframe_overlay();
        }

        /**
        *    Iframe overlay for edition
        */

        private remove_iframe_overlay(): void {
            if (this.iframes_overlay && this.iframes_overlay.length) {
                this.iframes_overlay.forEach((io: JQuery) => io.remove())
            }
        }

        private is_iframe_overlay(element: HTMLElement): HTMLElement {
            return element.className === 'iframeoverlay' ? $(element).data('referer') as any : element
        }

        /**
        *    EditBar positionning
        */

        private position(element: HTMLElement): void {
            var rect: ClientRect = Borders.rect(element);

            if (JSON.stringify(this.rect) !== JSON.stringify(rect)) {
                var down: boolean = rect.top - this.height < 0;

                this.iframe.jDom.css({
                    'top': down ? rect.bottom : rect.top - this.height,
                    'left': rect.right - this.width
                }).show();

                if (this.borders) {
                    this.borders.border(rect);
                } else {
                    this.borders = new Borders(element);
                }
                
                this.rect = rect;
            }
        }

        /**
        *    Duplicate current editing element
        */

        private duplicate(): void {
            var duplicable_parents: JQuery = $(this.editingElement).parents('li');
            var toDuplicate: JQuery = duplicable_parents.length ? duplicable_parents : $(this.editingElement);
            var duplicateElement: JQuery = toDuplicate.clone();
            duplicateElement.insertAfter(duplicable_parents.length ? duplicable_parents : this.editingElement);
        }

        /**
        *    Remove current editing element
        */

        private remove(): void {
            $(this.editingElement).remove();
            this.editingElement = null;
            this.hide();
        }

        /**
        *    Fill the last edit bar button with current editing element tag name
        */

        private fillTagButton(element: Element): void {
            // Fill button with current tag name
            if (element && element.tagName) {
                this.iframeBody.find('.button.tag .visible.content').html(element.tagName);
                this.iframeBody.find('.button.tag').next().html('select parent > ' + element.parentElement.tagName.toLowerCase()); 
            }
        }

        /**
        *    Show special button from element's tag name
        */

        private appendSpecialButton(element: Element): void {
            this.iframeBody.find('.button.special').hide();
            let tag: string = element.tagName.toLowerCase();

            // if it's an CKEDITOR editable element (text/div/etc)
            if (CKEDITOR.dtd.$editable[tag]) {
                this.iframeBody.find('.special.ckeditor').show();
            }

            // if the parent of current editing element as more than one child, show "move" button
            if ($(element).parent().children().length > 1) {
                this.iframeBody.find('.special.move').show();
            }

            switch (tag) {
                case 'img':
                    this.iframeBody.find('.special.img').show();
                    break
            }

            // fill tag button with element tag name
            this.fillTagButton(element);
        }

        /**
        *    CKEditor, text editor http://ckeditor.com/
        */

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
                    this.editor_dom.css({
                        'top': 0,
                        'left': 0,
                        'width': '93px',
                        'position': 'absolute',
                        'right': ''
                    }).show();
                }

                // we need to manually positionning ckeditor instance when ready
                this.editor.on('instanceReady', position)
                // we need to cancel the editor focus event because they re position editor and we don't want that :)
                this.editor.on('focus', (evt: CKEDITOR.eventInfo) => evt.cancel())
                // remove potential binding on key (with move etc..)
                $(this.stage.iframe.contentDocument).off('keydown')
            }

        }

        /**
        *    Image Edition
        */
        private update_img(url: string, alt: string): void {
            var depth: number = this.stage.url.split('/').length - 3; // remove project and file name

            if (url) {

                for (var i: number = 0; i < depth; i++) {
                    url = '../' + url
                }

                $(this.editingElement).attr('src', url);
            }

            $(this.editingElement).attr('alt', alt)
            $(this.editingElement).attr('title', alt)
        }

        private select_img(): void {
            let dirToInspect = this.stage.baseUrl.split('/').pop() + '/' + this.stage.url.split('/')[1];
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_FILES, { dir: dirToInspect }, (data: string[]) => {
                var alert: Alert = new Alert({
                    title: model.UI.EDIT_IMG_TITLE,
                    body: model.UI.EDIT_IMG_BODY,
                    icon: 'file image outline',
                    input: $(this.editingElement).attr('alt') || 'alternate text',
                    dropdown: data.filter((v: string) => { return !!v.match(/\.(JPG|JPEG|jpg|jpeg|png|gif)+$/) }),
                    onApprove: () => this.update_img(alert.getDropdownValue(), alert.getInputValue()),
                    onDeny: () => {}
                })
            })
        }

        /**
        *    Move element in his parent
        */

        private move(): void {
            let do_move = (e: JQueryKeyEventObject) => {
                e.originalEvent.preventDefault()

                if (!this.editingElement) {
                    return $(this.stage.iframe.contentDocument).off('keydown')
                }

                switch (e.keyCode) {
                    // up
                    case 38:
                        if (this.editingElement !== this.editingElement.parentElement.firstChild) {
                            $(this.editingElement).insertBefore(this.editingElement.previousSibling as Element)
                        }
                        break;

                    // down
                    case 40:
                        if (this.editingElement !== this.editingElement.parentElement.lastChild) {
                            $(this.editingElement).insertAfter(this.editingElement.nextSibling as Element)
                        }
                        break;
                }

                this.position(this.editingElement)
            }

            let events = $._data(this.stage.iframe.contentDocument as any, 'events')
            if (events && events.keydown) {
                $(this.stage.iframe.contentDocument).off('keydown')
            } else {
                new controllers.Alert({
                    title: model.UI.EDIT_MOVE_TITLE,
                    body: model.UI.EDIT_MOVE_BODY,
                    icon: 'keyboard',
                    onApprove: () => {
                        $(this.stage.iframe.contentDocument).keydown(do_move)
                    },
                    onDeny: () => { }
                })
            }
        }

        /**
        *    Handlebars handler for edit bar buttons
        */

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
                },
                img: {
                    click: () => this.select_img()
                },
                move: {
                    click: () => this.move()
                },
                parent: {
                    mouseover: () => this.borders.border(Borders.rect(this.editingElement.parentElement)),
                    mouseout: () => this.borders.border(Borders.rect(this.editingElement)),
                    click: () => this.show(this.editingElement.parentElement)
                }
            }, (key: string, handlers: model.HTMLEvent) => handlers.context = context)
        }
    }
}
