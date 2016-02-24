/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export interface AlertOptions {
        title: string;
        body?: string;
        onApprove?: any;
        onDeny?: any;
        icon?: string;
        image?: string;
        iframe?: string;
        input?: string;
        dropdown?: string[] | number[];
        link?: string;
        closable?: boolean;
    }

    export class Alert extends Handlebar {

        public onDeny: boolean;
        public closable: boolean;
        public onApprove: boolean;
        public buttonCount: string;

        constructor(public options: AlertOptions) {
            super(model.UI.HB_ALERT);

            $('.Alert').remove();

            if (!options.icon && !options.image && !options.iframe) {
                this.options.icon = 'warning sign'; //default
            }

            if (typeof options.body !== "string") {
                this.options.body = JSON.stringify(options.body)
            }

            this.onDeny = !!options.onDeny;
            this.onApprove = !!options.onApprove;
            this.buttonCount = options.onDeny && options.onApprove ? 'two' : 'one';
            this.closable = typeof options.closable === "boolean" ? options.closable : false;

            this.initWithContext(this).modal({
                closable: this.closable,
                onApprove: options.onApprove,
                onDeny: options.onDeny
            })
            .modal('show');

            if (options.dropdown) {
                this.jDom.find('.dropdown').dropdown();
            }
        }

        public getInputValue(): string {
            return this.jDom.find('.input input').val();
        }

        public getDropdownValue(): string {
            return this.jDom.find('.dropdown input').val();
        }

        public setWait(replace: string = 'checkmark'): void {
            var i: JQuery = this.jDom.find('.' + replace);
            if (i.length) {
                i.removeClass(replace).addClass('spinner loading');
            }
        }

        public hide(): void {
            this.jDom.modal('hide');
        }
    }
}
