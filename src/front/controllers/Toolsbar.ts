/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Stage.ts" />

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        public templates: Templates;
        public handlers: any = {
        	create: {click: () => this.create()}
        }

        constructor(public projectName: string, public stage: Stage) {
            super(model.UI.HB_TOOLSBAR);
            this.templates = new Templates(projectName, stage);
            this.initWithContext(this);
        }

        private create(): void {
			this.templates.show();
        }

    }
}
