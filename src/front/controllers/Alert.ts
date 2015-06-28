/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export interface AlertOptions {
        title: string;
        body?: string;
        onApprove?: any;
        onDeny?: any;
        icon?: string;
        image?: string;
        input?: string;
    }

    export class Alert extends Handlebar {

        public onDeny: boolean;
        public onApprove: boolean;
        public buttonCount: string;

        constructor(public options: AlertOptions) {
            super(model.UI.HB_ALERT);

            $('.Alert').remove();

            if (!options.icon && options.image) {
                this.options.icon = 'warning sign'; //default
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

        public hide(): void {
            this.jDom.modal('hide');
        }
    }
}
