/// <reference path="Handlebar.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/ServerApi.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../definition/jquery.plugin.d.ts" />

module OctoBoot.controllers {

    export class Stage extends Handlebar {

        public showAdress: boolean
        public iframe: HTMLIFrameElement
        public baseUrl: string
        public path: string
        public on_load: (url: string) => any

        constructor(public url: string = '/logo.html') {
            super(model.UI.HB_STAGE)
            this.showAdress = url !== '/logo.html'
            this.initWithContext(this)

            this.iframe = this.jDom.children('iframe').get()[0]

            var splitedUrl: Array<string> = url.split('/')
            var isProject: boolean = !!url.match(/^\/temp/)

            // ex /temp/123456789/
            this.baseUrl = isProject ? splitedUrl.slice(0, 3).join('/') : ''
            // ex /temp/123456789/project-name/
            this.path = isProject ? splitedUrl.slice(0, 4).join('/') + '/' : ''
            // ex /project-name/index.html OR  /project-name/subfolder/index.html
            this.url = url.substr(this.baseUrl.length)

            this.load(this.url)

            // Fix an issue with logo font size (wv) and modal scroll how set body height to document height
            this.jDom.css('max-height', window.screen.availHeight + 'px')
        }

        public destroy(): void {
            this.jDom.remove()
        }

        public load(url?: string): void {
            url = url || this.jDom.find('.text').html()
            this.url = url.replace(/http(:?s)*:\/\/(:?\w+\.){1,}\w+\//ig, '/')
            this.iframe.src = this.baseUrl + this.url

            if (this.showAdress) {
                this.refreshAndShowUrl()
            }

            if (this.on_load) {
                this.on_load(this.url)
            }
        }

        public reload(): void {
            this.iframe.contentWindow.location.reload()

            if (this.on_load) {
                this.on_load(this.url)
            }
        }

        public refreshAndShowUrl(): void {
            // clean
            this.jDom.find('.dropdown .menu').html('')
            // ask back for a list of dirs/files
            let dirToInspect = this.baseUrl.split('/').pop() + '/' + this.url.split('/')[1]
            core.Socket.getFilesListFiltered(dirToInspect, (data: string[]) => {
                data.forEach((dir: string, i: number, a: string[]) => {
                    // and append it to dropdown
                    this.jDom.find('.dropdown .menu').append('<div class="item">/' + this.url.split('/')[1] + '/' + dir + '</div>')
                })
                // active dropdown
                this.jDom.find('.dropdown').dropdown({ onChange: (value: string, text: string) => this.load(text), fullTextSearch: true, match: 'text' })
                this.jDom.find('.text').html(this.url)
            })
        }

        // APPLY RELATIVE PATH DEPTH FOR A GIVEN ROOT'S RELATIVE PATH URL
        // USEFULL TO PUT A PLUGIN OR LIB ON PAGE
        // IF WE HARE NOT IN DEPTH 1 (SUB-PAGE)
        public applyRelativeDepthOnUrl(url: string): string {
            var depth: number = this.url.split('/').length - 3 // remove project and file name

            for (var i: number = 0; i < depth; i++) {
                url = '../' + url
            }

            return encodeURI(url)
        }
    }
}
