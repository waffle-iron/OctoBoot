/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

	export class Stage extends Handlebar {

		constructor(public url: string = "/logo.html") {
			super(model.UI.HB_STAGE);
			this.initWithContext(this);
		}

        public destroy(): void {
            this.jDom.remove();
        }
	}
}
