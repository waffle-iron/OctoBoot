/// <reference path="Handlebar.ts" />
/// <reference path="Templates.ts" />
/// <reference path="Stage.ts" />

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        public templates: Templates;
        public createHandlers: model.HTMLEvent = {
            click: () => this.create()
        }
        public closeHandlers: model.HTMLEvent = {
            click: () => this.hide()
        }

        constructor(public projectName: string, public stage: Stage) {
            super(model.UI.HB_TOOLSBAR);
            this.templates = new Templates(projectName, stage);
            this.initWithContext(this, true)
                .sidebar({ dimPage: false})
                .sidebar('attach events', '.Stage .Tools')
                .sidebar('hide');

            $('.Sidebar').sidebar('attach events', this.jDom.children('.Settings'));
        }

        public show(): void {
            this.jDom.sidebar('show');
        }

        public hide(): void {
            this.jDom.sidebar('hide');
        }

        private create(): void {
			this.templates.show();
        }

    }
}
