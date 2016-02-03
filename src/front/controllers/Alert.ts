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
        link?: string;
    }

    export class Alert extends Handlebar {

        public onDeny: boolean;
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

            this.initWithContext(this).modal({
                closable: this.onDeny,
                onApprove: options.onApprove,
                onDeny: options.onDeny
            })
            .modal('show');
        }

        public getInputValue(): string {
            return this.jDom.find('input').val();
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
