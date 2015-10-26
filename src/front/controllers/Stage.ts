/// <reference path="Handlebar.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/ServerApi.ts" />

module OctoBoot.controllers {

    export class Stage extends Handlebar {

        public showAdress: boolean;
        public iframe: HTMLIFrameElement;

        private buttonEvent: model.HTMLEvent = {
            click: (e: MouseEvent) => this.load()
        }

        private inputEvent: model.HTMLEvent = {
            keyup: (e: KeyboardEvent) => e.keyCode === 13 && this.load(),
            focus: (e: FocusEvent) => this.refreshAndShowUrl() 
        }

        private baseUrl: string;

        constructor(public url: string = '/logo.html') {
            super(model.UI.HB_STAGE);
            this.showAdress = url !== '/logo.html';
            this.initWithContext(this);
            
            this.iframe = this.jDom.children('iframe').get()[0];
            this.baseUrl = url.match(/^\/temp\/\d+/) ? url.match(/^\/temp\/\d+/)[0] : '';
            this.url = url.substr(this.baseUrl.length);
            
            this.load(this.url);
            
            // Fix an issue with logo font size (wv) and modal scroll how set body height to document height
            this.jDom.css('max-height', window.screen.availHeight + 'px');
        }

        public destroy(): void {
            this.jDom.remove();
        }

        public load(url?: string): void {
            url = url || this.jDom.find('input').val();
            this.url = url.replace(/http(:?s)*:\/\/(:?\w+\.){1,}\w+\//ig, '/');
            this.iframe.src = this.baseUrl + this.url;
            this.jDom.find('input').val(this.url);
        }

        public reload(): void {
            this.iframe.contentWindow.location.reload();
        }

        public refreshAndShowUrl(): void {
            var dirToInspect = this.baseUrl.split('/').pop() + '/' + this.url.split('/')[1];
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_DIR, { dir: dirToInspect }, (data: any) => {
                console.log(data);
            })
        }
    }
}
