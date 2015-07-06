/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Stage extends Handlebar {

        public showAdress: boolean;
        public iframe: HTMLIFrameElement;

        constructor(public url: string = '/logo.html') {
            super(model.UI.HB_STAGE);
            this.showAdress = url !== '/logo.html';
            this.initWithContext(this);
            this.iframe = this.jDom.children('iframe').get()[0];
            // Fix an issue with logo font size (wv) and modal scroll how set body height to document height
            this.jDom.css('max-height', window.screen.availHeight + 'px');
        }

        public destroy(): void {
            this.jDom.remove();
        }

        public reload(): void {
            this.iframe.contentWindow.location.reload();
        }
    }
}
