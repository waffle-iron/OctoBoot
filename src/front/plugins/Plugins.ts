/// <reference path="../controllers/Handlebar.ts" />
/// <reference path="../controllers/Stage.ts" />
/// <reference path="../model/HTMLEvent.ts" />

module OctoBoot {

    export class Plugin extends controllers.Handlebar {

        public handlers: model.HTMLEvent = {
            dragstart: () => this.stick()
        }

        public container: JQuery;
        public stage: controllers.Stage;

        // to override if needed
        public allowedTag: string = 'ARTICLE|DIV';
        
        constructor(public name: string) {
            super(name)
        }

        public init(container: JQuery, stage: controllers.Stage) {
            this.container = container;
            this.stage = stage;

            return this.initWithContext(this, container)
        }

        private stick(): void {
            this.stage.iframe.contentWindow.ondragover = (e: DragEvent) => {
                var el: HTMLElement = e.target as HTMLElement;
                if (this.allowedTag.match(el.tagName.toUpperCase())) {
                    console.log(e.target)
                }
            }
        }
    }
}