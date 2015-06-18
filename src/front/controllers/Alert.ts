module OctoBoot.controllers {

	export class Alert {

		public onDeny: boolean;
		public onApprove: boolean;
		public buttonCount: string;

		constructor(public title: string, public body: string, onApprove?: any, onDeny?: any, public icon: string = 'warning sign') {
			this.onDeny = !!onDeny;
			this.onApprove = !!onApprove;
			this.buttonCount = onDeny && onApprove ? 'two' : 'one';

			$(document.body)
                .append(Handlebars.templates[model.UI.HB_ALERT](this));

            $(helper.HandlebarHelper.formatId(model.UI.HB_ALERT, '.'))
				.modal({
					closable: this.onDeny,
					onApprove: onApprove,
					onDeny: onDeny
				})
				.modal('show');
		}

		public hide(): void {
			$(helper.HandlebarHelper.formatId(model.UI.HB_ALERT, '.'))
				.modal('hide');
		}
	}
}
