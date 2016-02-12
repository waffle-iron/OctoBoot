/// <reference path="../definition/jquery.d.ts" />
/// <reference path="../definition/handlebars.d.ts" />
/// <reference path="../helper/HandlebarHelper.ts" />

module OctoBoot.controllers {

    export class Handlebar {

        public hbClassName: string;
        public jDom: JQuery;

        constructor(public hbTemplate: string) {
            this.hbClassName = helper.HandlebarHelper.formatId(hbTemplate, '.');
        }

        public getHtml(context: any): string {
            if (Handlebars.templates[this.hbTemplate]) {
                return Handlebars.templates[this.hbTemplate](context)
            } else {
                console.error('Handlebar error for', this.hbTemplate, 'template not found')
                return ''
            }
        }

        public initWithContext(context: any, customContainer?: JQuery): JQuery {
            // If main container are not ready yet, append on body, sidebar pusher will take everything in body and put in on pusher
            var container: JQuery = customContainer ? customContainer : $(model.UI.MAIN_CONTAINER).length ? $(model.UI.MAIN_CONTAINER) : $(document.body)
            container.append(this.getHtml(context));

            this.jDom = container.children().last()

            return this.jDom;
        }
    }
}
