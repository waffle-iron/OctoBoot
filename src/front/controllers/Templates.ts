/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    interface Template {
        path: string;
        min: string;
        name: string;
    }

    export class Templates extends Handlebar {

        public data: Array<Template> = [
            { path: '', min: 'http://semantic-ui.com/images/avatar/large/chris.jpg', name: 'empty' },
            { path: '', min: 'http://semantic-ui.com/images/avatar/large/chris.jpg', name: 'empty' }
        ];   

        constructor() {
            super(model.UI.HB_TEMPLATES);

            this.initWithContext(this);
        }

        public show(): void {
            this.jDom.modal('show');
        }

    }
}
