module GHBoot.controllers {

	export class Alert {

		public onDeny: boolean;
		public onApprove: boolean;

		constructor(public title: string, public body: string, onApprove?: any, onDeny?: any) {
			this.onDeny = !!onDeny;
			this.onApprove = !!onApprove;

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
	}
}
