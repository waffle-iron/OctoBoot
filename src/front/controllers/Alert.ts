/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

	export class Alert extends Handlebar {

		public onDeny: boolean;
		public onApprove: boolean;
		public buttonCount: string;

		constructor(public title: string, public body: string, onApprove?: any, onDeny?: any, public icon: string = 'warning sign') {
			super(model.UI.HB_ALERT);

			this.onDeny = !!onDeny;
			this.onApprove = !!onApprove;
			this.buttonCount = onDeny && onApprove ? 'two' : 'one';

            this.initWithContext(this).modal({
				closable: this.onDeny,
				onApprove: onApprove,
				onDeny: onDeny
			})
			.modal('show');
		}

		public hide(): void {
			this.jDom.modal('hide');
		}
	}
}
