/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        public templates: Templates;
        public handlers: any = {
        	create: {click: () => this.create()}
        }

        constructor() {
            super(model.UI.HB_TOOLSBAR);
            this.templates = new Templates();
            this.initWithContext(this);
        }

        private create(): void {
			this.templates.show();
        }

    }
}
