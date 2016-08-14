/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export interface AlertOptions {
        title: string;
        body?: string;
        onApprove?: any;
        onApproveText?: string;
        onApproveClass?: string;
        onApproveIcon?: string;
        onDeny?: any;
        onDenyText?: string;
        onDenyClass?: string;
        onDenyIcon?: string;
        icon?: string;
        image?: string;
        iframe?: string;
        input?: string;
        dropdown?: string[] | number[];
        progress?: boolean;
        link?: string;
        timestamp?: number;
        closable?: boolean;
        onVisible?: Function;
    }

    export class Alert extends Handlebar {

        public onDeny: boolean;
        public closable: boolean;
        public onApprove: boolean;
        public buttonCount: string;

        constructor(public options: AlertOptions) {
            super(model.UI.HB_ALERT);

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

            this.options.onApproveText = options.onApproveText || 'OK'
            this.options.onApproveClass = options.onApproveClass || 'ok green'
            this.options.onApproveIcon = options.onApproveIcon || 'checkmark'

            this.options.onDenyText = options.onDenyText || 'CANCEL'
            this.options.onDenyClass = options.onDenyClass || 'deny red'
            this.options.onDenyIcon = options.onDenyIcon || 'remove'

            this.initWithContext(this).modal({
                closable: this.closable,
                onApprove: options.onApprove,
                onDeny: options.onDeny,
                onVisible: options.onVisible
            })
            .modal('show');

            if (options.dropdown) {
                this.jDom.find('.dropdown').dropdown({fullTextSearch: true, match: 'text'});
            }

            if (options.dropdown && options.input) {
                this.jDom.find('.input').css('margin-top', 15)
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
