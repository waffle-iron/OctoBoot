/// <reference path="Handlebar.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/ServerApi.ts" />
/// <reference path="../model/UI.ts" />
/// <reference path="../definition/jquery.plugin.d.ts" />

module OctoBoot.controllers {

    export class Stage extends Handlebar {

        public showAdress: boolean;
        public iframe: HTMLIFrameElement;
        public baseUrl: string;

        private files_weight_order = {
            html: 6,
            png: 5,
            jpg: 4,
            css: 3,
            js: 2
        };

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
            url = url || this.jDom.find('.text').html();
            this.url = url.replace(/http(:?s)*:\/\/(:?\w+\.){1,}\w+\//ig, '/');
            this.iframe.src = this.baseUrl + this.url;
            
            if (this.showAdress) {
                this.refreshAndShowUrl(); 
            }
        }

        public reload(): void {
            this.iframe.contentWindow.location.reload();
        }

        public refreshAndShowUrl(): void {
            // clean
            this.jDom.find('.dropdown .menu').html('');
            // ask back for a list of dirs/files
            let dirToInspect = this.baseUrl.split('/').pop() + '/' + this.url.split('/')[1];
            core.Socket.emit(model.ServerAPI.SOCKET_LIST_FILES, { dir: dirToInspect }, (data: string[]) => {
                // filter files
                //let dirs: string[] = data.map((v: string) => { return v.split(dirToInspect).pop() }) //data.filter((value: string, i: number, a: string[]) => { return value === 'index.html' || !value.match(/(?:\.|bootstrap|assets)/) });
                data.sort((a: string, b: string) => {
                    let aw: number = this.files_weight_order[a.split('.').pop()] || 1
                    let bw: number = this.files_weight_order[b.split('.').pop()] || 1
                    return bw - aw
                })
                
                data.forEach((dir: string, i: number, a: string[]) => {
                    // and append it to dropdown
                    this.jDom.find('.dropdown .menu').append('<div class="item">/' + this.url.split('/')[1] + '/' + dir + '</div>');
                })
                // active dropdown
                this.jDom.find('.dropdown').dropdown({ onChange: (value: string, text: string) => this.load(text) });
                this.jDom.find('.text').html(this.url);
            })
        }
    }
}
