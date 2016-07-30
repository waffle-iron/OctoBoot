/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Alert.ts" />
/// <reference path="Stage.ts" />
/// <reference path="EditBar.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../helper/Dom.ts" />
/// <reference path="../plugins/Ref.ts" />

interface Window {
    octoboot_before_save?: Function;
}

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        public templates: Templates
        public editing: boolean

        public createHandlers: model.HTMLEvent = {
            click: () => this.create()
        }

        public saveHandlers: model.HTMLEvent = {
            click: () => this.save()
        }

        public publishHandlers: model.HTMLEvent = {
            click: () => this.publish()
        }

        public editHandlers: model.HTMLEvent = {
            click: () => this.edit()
        }

        public duplicateHandlers: model.HTMLEvent = {
            click: () => this.duplicate()
        }

        public backgroundHandlers: model.HTMLEvent = {
            click: () => this.background()
        }

        public uploadHandlers: model.HTMLEvent = {
            click: () => this.upload()
        }

        public removeHandlers: model.HTMLEvent = {
            click: () => this.remove()
        }

        public pluginsHandlers: model.HTMLEvent = {
            click: () => this.plugins()
        }

        private editBarHover: EditBar
        private editBarClick: EditBar
        private edits: Array<EditBar>
        private inputUpload: HTMLInputElement
        private fileReader: FileReader
        private actionToCancel: Function

        constructor(public projectName: string, public stage: Stage, public repoUrl: string, public sidebar: JQuery) {
            super(model.UI.HB_TOOLSBAR)
            this.initWithContext(this, this.stage.jDom)

            this.templates = new Templates(this.projectName, this.stage)

            this.sidebar.sidebar('attach events', this.jDom.children('.settings'))

            core.Socket.io.on('404', () => helper.Dom.setItemActive(this.jDom, 'New'))
            core.Socket.io.on('save_available', () => helper.Dom.setItemActive(this.jDom, 'save'))

            this.inputUpload = $('input#upload').get(0) as HTMLInputElement

            this.initPlugins()

            // if stage is reload, cancel action like edit / duplicate / etc...
            this.stage.on_load = (url: string) => {
                if (this.actionToCancel) {
                    this.actionToCancel()
                }
            }
        }

        private initPlugins(): void {
            this.jDom.find('.item.plugins').hide()
            // check if user is in the whitelist for plugin
            core.GitHub.getUser((user: model.GitHubUser) => {
                $.get(model.ServerAPI.WHITELIST.replace(':for', 'plugin').replace(':from', user.login), () => {
                    this.jDom.find('.item.plugins').show()
                    for (var name in OctoBoot.plugins) {
                        new OctoBoot.plugins[name]()
                        .init(this.jDom.find('.menu.plugins'), this.stage, this.projectName)
                        .hide()
                    }
                })
            })
        }

        private plugins(): void {
            if (this.actionToCancel) {
                this.actionToCancel()
            }
            this.jDom.find('.menu.plugins .item').slideToggle()
        }

        private create(): void {
			this.templates.show()
        }

        private save(): void {
            // if action running, cancel it
            if (this.actionToCancel) {
                this.actionToCancel()
            }

            let do_save: Function = () => {
                helper.Dom.setIconLoading(this.jDom, ['save'])

                var uri: string[] = this.stage.url.split('/')
                var file: string = uri.pop()

                core.Socket.emit(model.ServerAPI.SOCKET_SAVE, {
                    name: uri.join('/'),
                    url: this.repoUrl,
                    content: helper.Dom.formatDocumentToString(this.stage.iframe.contentDocument),
                    file: file
                }, (error: string) => {
                    if (error) {
                        new Alert({ title: 'Error on save', body: error, onApprove: () => {}})
                    } else {
                        helper.Dom.setItemActive(this.jDom, 'publish')
                        this.stage.reload()
                    }
                    helper.Dom.setIconLoading(this.jDom, ['save'], false)
                })
            }

            // if we find a custom action to do on the edited project, execut it
            if (this.stage.iframe.contentWindow.octoboot_before_save) {
                this.stage.iframe.contentWindow.octoboot_before_save(do_save)
            } else {
                do_save()
            }

        }

        private publish(): void {
            var alert: Alert = new Alert({
                title: model.UI.PUBLISH_ALERT_TITLE,
                body: model.UI.PUBLISH_ALERT_BODY,
                onApprove: () => {

                    alert.setWait()
                    helper.Dom.setIconLoading(this.jDom, ['cloud', 'upload'])

                    core.Socket.emit(model.ServerAPI.SOCKET_PUBLISH, { name: this.projectName, url: this.repoUrl }, (error: string) => {

                        if (!error) {
                            helper.Dom.setIconLoading(this.jDom, ['cloud', 'upload'], false)

                            new Alert({
                                title: 'Publish success !',
                                icon: 'checkmark',
                                link: 'http://' + this.repoUrl.match(/github\.com\/(.+)\/.+\.git/)[1].toLowerCase() + '.github.io/' + this.projectName,
                                onApprove: () => { }
                            })
                        } else {
                            new Alert({
                                title: 'Publish error !',
                                body: error,
                                onApprove: () => { }
                            })
                        }

                    })

                    return false
                },
                onDeny: () => {}
            })
        }

        private unload(e: BeforeUnloadEvent): string {
            var e = e || window.event

            if (e) {
                e.returnValue = "Are you sure ? Your work is not saved..."
            }

            return "Are you sure ? Your work is not saved..."
        }

        private edit(): void {
            var container: JQuery = $(this.stage.iframe.contentDocument.body)
            // if we want to edit a js / css file, start editing in basic mode
            var basicEdit: boolean = container.children().length === 1 && container.children().get(0).tagName.toUpperCase() === 'PRE'

            // Bind events on window if not already done for editing
            if (!basicEdit) {
                this.bindEditionEvents()
            }

            // Editing flag
            this.editing = !this.editing
            this.stage.iframe.contentWindow['editing'] = this.editing

            if (this.editing) {

                // if action running, cancel it
                if (this.actionToCancel) {
                    this.actionToCancel()
                }

                this.actionToCancel = this.edit

                helper.Dom.setItemActive(this.jDom, 'edit')
                if (basicEdit) {
                    container.children().get(0).contentEditable = "true"
                } else {
                    // most case, inline editing full mode
                    // create or reset EditBar on click and hover (need two different EditBar)
                    this.editBarClick = new EditBar(container, this.stage)
                    this.editBarHover = new EditBar(container, this.stage)
                    this.editBarHover.init_iframes_overlay()
                }

                $(window).on('beforeunload', this.unload)
                $(this.stage.iframe.contentWindow).on('beforeunload', this.unload)
            } else {
                // If not editing, destroy EditBar
                this.actionToCancel = null
                helper.Dom.setItemActive(this.jDom, 'null')
                if (!basicEdit) {
                    this.editBarHover.jDom.popup('hide all')
                    this.editBarClick.destroy()
                    this.editBarHover.destroy()
                } else {
                    container.children().removeAttr('contentEditable')
                }

                $(window).off('beforeunload')
                $(this.stage.iframe.contentWindow).off('beforeunload')
            }
        }

        private duplicate(): void {
            if (!this.edits) {
                helper.Dom.setItemActive(this.jDom, 'duplicate')
                // if action running, cancel it
                if (this.actionToCancel) {
                    this.actionToCancel()
                }

                this.actionToCancel = this.duplicate

                this.edits = []

                var container: JQuery = $(this.stage.iframe.contentDocument.body)
                var duplicables = container.find('*[ob-duplicable]')

                var add_edit: (e: HTMLElement, exec_cbk?: boolean) => any = (e: HTMLElement) => {
                    let edit: EditBar = new EditBar(container, this.stage)
                    this.edits.push(edit)
                    edit.show(e, '.duplicate, .remove')
                    edit.on_duplicate = add_edit
                }

                var alert: Alert = new Alert({
                    title: 'Duplicate - Please wait',
                    body: 'This can take one minute if you have many duplicable element',
                    icon: 'notched circle loading',
                    onVisible: () => {
                        duplicables.each((i, e) => {
                            if ($(e).css('display') !== 'none') {
                                setTimeout(() => add_edit(e as HTMLElement), 1)
                            }
                        })

                        setTimeout(() => {
                            alert.hide()
                        }, 100)
                    }
                })

            } else {
                helper.Dom.setItemActive(this.jDom, 'null')
                this.edits.forEach((edit: EditBar) => edit.destroy())
                this.edits = null
                this.actionToCancel = null
            }
        }

        private background(): void {
            if (!this.edits) {
                helper.Dom.setItemActive(this.jDom, 'background')
                // if action running, cancel it
                if (this.actionToCancel) {
                    this.actionToCancel()
                }

                this.actionToCancel = this.background

                this.edits = []

                var container: JQuery = $(this.stage.iframe.contentDocument.body)
                var editables = container.find('*').filter((i, e) => {
                    var cs: CSSStyleDeclaration = getComputedStyle(e)
                    return !!(cs.backgroundImage && cs.backgroundImage !== 'none') || e.tagName.toLowerCase() === 'img'
                })

                var add_edit: (e: HTMLElement) => any = (e: HTMLElement) => {
                    let edit: EditBar = new EditBar(container, this.stage)
                    this.edits.push(edit)
                    edit.show(e, '.img')
                }

                var alert: Alert = new Alert({
                    title: 'Image edition - Please wait',
                    body: 'This can take one minute if you have many images',
                    icon: 'notched circle loading',
                    onVisible: () => {
                        editables.each((i, e) => {
                            setTimeout(() => add_edit(e as HTMLElement), 1)
                        })

                        setTimeout(() => {
                            alert.hide()
                        }, 100)
                    }
                })

            } else {
                helper.Dom.setItemActive(this.jDom, 'null')
                this.edits.forEach((edit: EditBar) => edit.destroy())
                this.edits = null
                this.actionToCancel = null
            }
        }

        private upload(): void {
            $(this.inputUpload).click()
            $(this.inputUpload).one('change', (e) => {
                helper.Dom.setIconLoading(this.jDom, ['upload'], true)
                this.fileReader = new FileReader()
                this.fileReader.readAsArrayBuffer(this.inputUpload.files[0])
                this.fileReader.onloadend = (e: any) => {
                    var xhr: XMLHttpRequest = new XMLHttpRequest()
                    xhr.open('POST', model.ServerAPI.UPLOAD
                            .replace(/:sid/, core.Socket.sid.toString())
                            .replace(/:project/, this.projectName)
                            .replace(/:filename/, this.inputUpload.files[0].name))
                    xhr.onloadend = () => {
                        helper.Dom.setIconLoading(this.jDom, ['upload'], false)
                        this.stage.refreshAndShowUrl()

                        if (xhr.status !== 200) {
                            new Alert({title: 'Upload error', onApprove: () => {}})
                        }
                    }
                    xhr.setRequestHeader('Content-Type', this.inputUpload.files[0].type)
                    xhr.send(e.target.result)
                }
            })
        }

        private remove(): void {
            var alert: Alert = new Alert({
                title: model.UI.DELETE_FILE_ALERT_TITLE,
                body: model.UI.DELETE_FILE_ALERT_BODY.replace('[FILE]', this.stage.url),
                onApprove: () => {

                    core.Socket.emit(model.ServerAPI.SOCKET_REMOVE_FILE, { uri: this.stage.url }, (error: string) => {
                        if (!error) {
                            alert.hide()
                            this.stage.reload()
                            this.stage.refreshAndShowUrl()
                        } else {
                            new Alert({title: 'Error when removing file', body: error, onApprove: () => {}})
                        }
                    })

                    // prevent modal to close
                    return false
                },
                onDeny: () => {}
            })
        }

        // TODO SEE TO MOVE THIS ON EDIT BAR
        private bindEditionEvents(): void {
            var timeout_popup: number

            if (this.stage.iframe.contentWindow['edit_event_binded']) {
                return
            }

            this.stage.iframe.contentWindow.addEventListener('mousemove', (e: MouseEvent) => {
                let element: HTMLElement = $(e.target).get(0)
                if (this.editing && !this.editBarClick.editingElement) {
                    // if we are in editing mode AND nothing currently editing
                    this.editBarHover.show(element)
                    clearTimeout(timeout_popup)
                    this.editBarHover.jDom.popup('hide')
                    timeout_popup = setTimeout(() => this.editBarHover.jDom.popup('show'), 2000)
                }
            })

            var click = (e: JQueryEventObject) => {
                clearTimeout(timeout_popup)
                this.editBarHover.jDom.popup('hide all')

                let element: HTMLElement = $(e.target).get(0)
                if (this.editing && !this.editBarClick.editingElement) {
                    // if we are in editing mode, and nothing currently in edition, active edit bar
                    this.editBarClick.show(element)
                    this.editBarHover.hide()
                } else if (
                    // if we've not click on ckeditor
                    (!this.editBarClick.editor_dom || !helper.Dom.hasParent(element, this.editBarClick.editor_dom.get(0))) &&
                    // editing element either
                    !helper.Dom.hasParent(element, this.editBarClick.editingElement) &&
                    // and we click OUTSIDE our editing element
                    !helper.Dom.mouseIsOverElement(e.originalEvent as MouseEvent, this.editBarClick.editingElement)) {
                    // disable edit bar (so reactive on mousemove)
                    this.editBarClick.hide()
                }

                if (e.type.match(/dblclick|keydown/) && this.editing && this.editBarClick.editingElement) {
                    // if dblclick action, execute default action (text edit / image update / etc..)
                    this.editBarClick.default(element)
                }
            }

            var keydown = (e: JQueryEventObject) => {
                // if spacebar pressed
                if (e.keyCode === 32 && this.editBarHover.editingElement) {
                    e.preventDefault()
                    e.target = this.editBarHover.editingElement
                    click(e)
                }
            }

            $(this.stage.iframe.contentWindow).click(click)
            $(this.stage.iframe.contentWindow).dblclick(click)
            // prevent stage link to redirect when editing
            $(this.stage.iframe.contentDocument).on('click', 'a', (e: JQueryEventObject) => {
                e.preventDefault()
                e.stopImmediatePropagation()
                click(e)
                return false
            })

            $(window).on('keydown', keydown)
            $(this.stage.iframe.contentWindow).on('keydown', keydown)

            // Editing flag for binded event
            this.stage.iframe.contentWindow['edit_event_binded'] = true
        }

    }
}
