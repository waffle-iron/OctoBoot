/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Stage extends Handlebar {

        constructor(public url: string = "/logo.html") {
            super(model.UI.HB_STAGE);
            this.initWithContext(this);
            // Fix an issue with logo font size (wv) and modal scroll how set body height to document height
            this.jDom.css('max-height', window.screen.availHeight + 'px');
        }

        public destroy(): void {
            this.jDom.remove();
        }
    }
}
