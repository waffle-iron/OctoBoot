/// <reference path="Handlebar.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="Borders.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../model/HTMLEvent.ts" />
/// <reference path="../definition/ckeditor.d.ts" />

module OctoBoot.controllers {

    export var EditBarCopiedElement: JQuery

    export class EditBar extends Handlebar {

        // iframe container of EditingBar
        public iframe: Handlebar
        public iframeBody: JQuery

        // current editing element
        public editingElement: HTMLElement

        // text editor
        public editor: CKEDITOR.editor
        public editor_dom: JQuery

        // public callback
        public on_duplicate: (e: HTMLElement) => any

        // lines who border the editing element
        private borders: Borders
        // extended editable
        private editable_extended = { span: 1, strong: 1, li: 1, u: 1 }
        // extended ignored element
        private ignored_extended = { span: 0, strong: 0, b: 0, u: 0, i: 0 }
        // interval positioning
        private interval: number
        private timer_show: number
        // current top
        private top: number
        // current left
        private left: number
        // iframe edition overlay
        private iframes_overlay: JQuery[]
        private position_infos: any

        constructor(public container: JQuery, public stage: Stage) {
            super(model.UI.HB_EDITBAR)

            this.initWithContext(this.HBHandlers(), this.stage.jDom)

            // activate popup on edit button
            this.jDom.find('.button.topleft').popup({ inline: true, position: 'top left' })
            this.jDom.find('.button.topright').popup({ inline: true, position: 'top right' })

            // extend ckeditor editable because we do the positioning manually )
            jQuery.extend(CKEDITOR.dtd.$editable, this.editable_extended)
            jQuery.extend(CKEDITOR.dtd.$removeEmpty, this.ignored_extended)
            CKEDITOR.config.allowedContent = true
            CKEDITOR.config.autoParagraph = false

            $(this.stage.iframe.contentWindow).scroll(() => this.show_with_delay())
        }

        // we can't handle mouseover and click on iframe, and subframe etc..
        // so put an overlay over it with related iframe on overlay's data to handle properly
        public init_iframes_overlay(): void {
            this.remove_iframe_overlay()

            this.iframes_overlay = []
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

        public show(element: HTMLElement, onlyButtons?: string /*css selector*/): void {
            // if we are over iframe_overlay, get related iframe element, else keep it
            element = this.is_iframe_overlay(element)

            if (element.tagName.toLowerCase().match(/^(b|i|u|em)$/)){
                element = element.parentElement
            }

            if (element.getBoundingClientRect && element !== this.editingElement) {
                this.editingElement = element
                clearInterval(this.interval)
                this.interval = setInterval(() => this.position(element, true), 100)

                if (onlyButtons) {
                    this.setOnly(onlyButtons)
                } else {
                    this.appendSpecialButton(element)
                }

                this.jDom.show()

                this.position_infos = {
                    content_height: $(this.stage.iframe.contentDocument).height(),
                    iframe_position: $(this.stage.iframe).position(),
                    iframe_height: $(this.stage.iframe).height(),
                    iframe_width: $(this.stage.iframe).width(),
                    width: this.jDom.width(),
                    height: this.jDom.height(),
                }

                this.position(element, true)
            }
        }

        /**
        *    Default action (on dlbclick usually)
        */

        public default(element: HTMLElement): void {
            switch (element.tagName.toLowerCase()) {
                case 'img':
                    this.select_img()
                    break

                case 'a':
                    this.link()
                    break

                case 'iframe':
                    this.move()
                    break

                default:
                    this.ckeditor()
                    break

            }
        }

        /**
        *    Hide EditBar
        */

        public hide(): void {
            clearInterval(this.interval)
            this.interval = null

            if (this.jDom) {
                this.jDom.hide()
            }

            if (this.borders) {
                this.borders.destroy()
            }

            if (this.editingElement) {
                this.editingElement.removeAttribute('contentEditable')
            }

            $(this.stage.iframe.contentDocument).off('keydown')
            $(document).off('keydown')

            this.editingElement = null
            this.top = null
            this.left = null

            if (this.editor) {
                this.editor.destroy()
                this.editor = null
            }
        }

        /**
        *    Destroy EditBar
        */

        public destroy(): void {
            if (this.borders) {
                this.borders.clean()
                this.borders = null
            }

            $('.editbar').remove()
            this.jDom = null
            this.hide()
            this.remove_iframe_overlay()
        }

        /**
        *    Check if element have background
        */


        public haveBackground(e: Element): boolean {
            var cs: CSSStyleDeclaration = getComputedStyle(e)
            return cs.backgroundImage && cs.backgroundImage !== 'none'
        }

        /**
        *    Activate only some button
        */

        private setOnly(on: string): void {
            this.jDom.find('.button').hide()
            this.jDom.find(on).show()
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

        private position(element: HTMLElement, withBorder: boolean = true, force: boolean = false): void {

            if (this.jDom.css('display') === 'none') return
            if (element.tagName.toLowerCase() === 'a' && element.children.length) {
                element = element.firstChild as HTMLElement
            }

            var rect: ClientRect = Borders.rect(element)

            var offset: number = this.position_infos.iframe_position.top - this.stage.iframe.contentWindow.scrollY
            var top: number = rect.top - this.position_infos.height + offset
            var bottom: number = rect.bottom + offset
            var left : number = rect.right + this.position_infos.iframe_position.left - this.position_infos.width

            // rectif max top
            top = top < this.position_infos.iframe_position.top || top < 0 ?
                bottom < this.position_infos.iframe_height ? bottom : top : top
            top = top > -5 ? Math.max(top, this.position_infos.iframe_position.top) : top
            // rectif max bottom
            top = Math.min(top, this.position_infos.content_height - (this.position_infos.height * 2) + offset)
            // rectif max right
            left = Math.min(left, this.position_infos.iframe_width + this.position_infos.iframe_position.left - (this.position_infos.height * 2))
            // rectif max left
            left = Math.max(left, this.position_infos.iframe_position.left)

            if (this.top === top && this.left === left && !force) {
                return
            }

            this.top = top
            this.left = left

            this.jDom.css({
                'top': this.top,
                'left': this.left
            })

            if (this.borders && withBorder) {
                this.borders.element = element
                this.borders.refresh()
            } else if (withBorder) {
                this.borders = new Borders(element)
            }
        }

        private show_with_delay(delay: number = 250) {
            if (this.editingElement) {
                clearTimeout(this.timer_show)

                if (!this.timer_show) {
                    this.jDom.hide()
                }

                this.timer_show = setTimeout(() => {this.jDom.fadeIn(); this.timer_show = null}, delay)
            }
        }

        /**
        *    Duplicate current editing element
        */

        private duplicate(): void {
            var duplicable_parents: JQuery = $(this.editingElement).parents('li')
            var toDuplicate: JQuery = duplicable_parents.length ? duplicable_parents : $(this.editingElement)
            var duplicateElement: JQuery = toDuplicate.clone()
            duplicateElement.insertAfter(duplicable_parents.length ? duplicable_parents : this.editingElement)

            if (this.on_duplicate) {
                this.on_duplicate(duplicateElement.get(0))
            }
        }

        private markduplicate(): void {
            if (!$(this.editingElement).attr('ob-duplicable')) {
                $(this.editingElement).attr('ob-duplicable', 'true')
                new Alert({
                    title: model.UI.EDIT_MARK_DUPLICATE_TITLE,
                    body: model.UI.EDIT_MARK_DUPLICATE_BODY,
                    icon: 'checkmark',
                    onApprove: () => {}
                })
            } else {
                new Alert({
                    title: model.UI.EDIT_MARK_DUPLICATE_TITLE,
                    body: model.UI.EDIT_MARK_DUPLICATE_RESET_BODY,
                    onApprove: () => $(this.editingElement).removeAttr('ob-duplicable'),
                    onDeny: () => {}
                })
            }
        }

        /**
        *    Remove current editing element
        */

        private remove(): void {
            $(this.editingElement).remove()
            this.editingElement = null
            this.hide()
        }

        /**
        *    Fill the last edit bar button with current editing element tag name
        */

        private fillTagButton(element: Element): void {
            // Fill button with current tag name
            if (element && element.tagName) {
                this.jDom.find('.button.tag .visible.content').html(element.tagName)
                this.jDom.find('.button.tag').next().html('select parent > ' + element.parentElement.tagName.toLowerCase())
            }
        }

        /**
        *    Show special button from element's tag name
        */

        private appendSpecialButton(element: Element): void {
            this.jDom.find('.button.special').hide()
            let tag: string = element.tagName.toLowerCase()

            // if it's an CKEDITOR editable element (text/div/etc)
            if (CKEDITOR.dtd.$editable[tag]) {
                this.jDom.find('.special.ckeditor').show()
            }

            // if the parent of current editing element as more than one child, show "move" button
            if ($(element).parent().children().length > 1) {
                this.jDom.find('.special.move').show()
            }

            // if we have a copied element in storage, show paste button
            if (EditBarCopiedElement) {
                this.jDom.find('.special.paste').show()
            }

            // if element got background image property, allow to edit it
            if (this.haveBackground(element)) {
                this.jDom.find('.special.img').show()
            }

            switch (tag) {
                case 'img':
                    this.jDom.find('.special.img').show()
                    break
            }

            // fill tag button with element tag name
            this.fillTagButton(element)
        }

        /**
        *    CKEditor, text editor http://ckeditor.com/
        */

        private ckeditor(): void {
            if (this.editor) {
                this.editor.destroy()
                this.editor = null
                this.editingElement.removeAttribute('contentEditable')
            } else {
                this.editingElement.contentEditable = 'true'
                this.editor = CKEDITOR.inline(this.editingElement)
                this.editingElement.focus()

                var position = (evt: CKEDITOR.eventInfo) => {
                    this.editor_dom = $('.cke')
                    this.editor_dom.css({
                        'top': 0,
                        'left': 0,
                        'width': '93px',
                        'position': 'absolute',
                        'right': ''
                    }).show()
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
            if (this.haveBackground(this.editingElement) && url) {
                // background
                $(this.editingElement).css('background-image', 'url(' + this.stage.applyRelativeDepthOnUrl(url) + ')')
            } else {
                // img node
                if (url) {
                    $(this.editingElement).attr('src', this.stage.applyRelativeDepthOnUrl(url))
                }

                $(this.editingElement).attr('alt', alt)
                $(this.editingElement).attr('title', alt)
            }

        }

        private select_img(): void {
            let dirToInspect = this.stage.baseUrl.split('/').pop() + '/' + this.stage.url.split('/')[1]
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_FILES, { dir: dirToInspect }, (data: string[]) => {
                var alert: Alert = new Alert({
                    title: model.UI.EDIT_IMG_TITLE,
                    body: model.UI.EDIT_IMG_BODY,
                    icon: 'file image outline',
                    input: this.haveBackground(this.editingElement) ? '' : $(this.editingElement).attr('alt') || 'alternate text',
                    dropdown: data.filter((v: string) => {
                        return !!v.match(/\.(JPG|JPEG|jpg|jpeg|png|gif)+$/)
                    }).map((v: string) => {
                        return this.stage.path + v
                    }),
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
                    $(this.stage.iframe.contentDocument).off('keydown')
                    $(document).off('keydown')
                    return
                }

                switch (e.keyCode) {
                    // up
                    case 38:
                        if (this.editingElement !== this.editingElement.parentElement.firstChild) {
                            $(this.editingElement).insertBefore(this.editingElement.previousSibling as Element)
                        }
                        break

                    // down
                    case 40:
                        if (this.editingElement !== this.editingElement.parentElement.lastChild) {
                            $(this.editingElement).insertAfter(this.editingElement.nextSibling as Element)
                        }
                        break
                }

                this.position(this.editingElement)
            }

            let events = $._data(document as any, 'events')
            if (events && events.keydown) {
                $(this.stage.iframe.contentDocument).off('keydown')
                $(document).off('keydown')
                this.jDom.find('.move').blur()
            } else {
                new controllers.Alert({
                    title: model.UI.EDIT_MOVE_TITLE,
                    body: model.UI.EDIT_MOVE_BODY,
                    icon: 'keyboard',
                    onApprove: () => {
                        $(this.stage.iframe.contentDocument).keydown(do_move)
                        $(document).keydown(do_move)
                    },
                    onDeny: () => { }
                })
            }
        }

        /**
        *    Copy current element to EditBarCopiedElement
        */

        private copy(): void {
            EditBarCopiedElement = $(this.editingElement).clone()
            this.jDom.find('.special.paste').show()
        }

        /**
        *    Paste EditBarCopiedElement
        */

        private paste(): void {
            var actions: string[] = [
                'replace with selected element',
                'append inside selected element',
                'append after selected element',
                'append before selected element'
            ]
            var copiedElement: JQuery = EditBarCopiedElement.clone()
            var alert: Alert = new Alert({
                title: 'Paste element',
                body: 'Choose an action to paste your previously copied element (' + copiedElement.get(0).tagName + ')',
                icon: 'paste',
                dropdown: actions,
                onApprove: () => {
                    switch (alert.getDropdownValue()) {

                        case actions[0]:
                            if (this.editingElement.tagName !== copiedElement.get(0).tagName || !copiedElement.hasClass(this.editingElement.className)) {
                                new Alert({
                                    title: 'Paste warning',
                                    body: 'Do care ! It seems that both element are not the same, are you sure about your action ?',
                                    onApprove: () => $(this.editingElement).replaceWith(copiedElement),
                                    onDeny: () => {}
                                })
                            } else {
                                $(this.editingElement).replaceWith(copiedElement)
                            }
                            break

                        case actions[1]:
                            $(this.editingElement).append(copiedElement)
                            break

                        case actions[2]:
                            copiedElement.insertAfter(this.editingElement)
                            break

                        case actions[3]:
                            copiedElement.insertBefore(this.editingElement)
                            break
                    }
                },
                onDeny: () => {}
            })
        }

        /**
         *    Create / Edit link
         */

        private link(): void {
            var editLink = (url: string, target: string) => {
                let link: HTMLAnchorElement = this.editingElement as HTMLAnchorElement

                if ($(link).parents('a').length) {
                    link = $(link).parents('a').get(0) as HTMLAnchorElement
                } else if (link.tagName.toUpperCase() !== "A") {
                    // create link
                    link = document.createElement('a')
                    $(link).insertBefore(this.editingElement)
                    $(link).append(this.editingElement)
                }

                link.href = url
                link.target = target

                this.show(link)
            }

            let dirToInspect = this.stage.baseUrl.split('/').pop() + '/' + this.stage.url.split('/')[1]
            core.Socket.getFilesListFiltered(dirToInspect, (data: string[]) => {
                var alertUrl: Alert = new Alert({
                    title: 'Create link',
                    body: 'Please choose a local url (one from your website) OR type a external http url on the bottom input',
                    icon: 'linkify',
                    input: 'http://...',
                    dropdown: data,
                    onApprove: () => {
                        var alertTarget: Alert = new Alert({
                            title: 'Create link',
                            body: 'Please choose a target, open the link on a new window (_blank) or in the current window (_self)',
                            dropdown: ['_blank', '_self'],
                            icon: 'linkify',
                            onApprove: () => editLink(
                                alertUrl.getDropdownValue() ? this.stage.applyRelativeDepthOnUrl(alertUrl.getDropdownValue()) : alertUrl.getInputValue(),
                                alertTarget.getDropdownValue()
                            ),
                            onDeny: () => { }
                        })
                    },
                    onDeny: () => {}
                })
            })

        }

        /**
        *    Handlebars handler for edit bar buttons
        */

        private HBHandlers(): any {
            return {
                duplicate : {
                    click: () => this.duplicate()
                },
                markduplicate: {
                    click: () => this.markduplicate()
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
                    mouseout: () => this.position(this.editingElement, true, true),
                    click: () => { this.show(this.editingElement.parentElement); this.jDom.find('.tag').blur() }
                },
                copy : {
                    click: () => this.copy()
                },
                paste : {
                    click: () => this.paste()
                },
                link: {
                    click: () => this.link()
                }
            }
        }
    }
}
