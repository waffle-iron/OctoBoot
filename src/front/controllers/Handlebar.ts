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

        initWithContext(context: any): JQuery {
            // If main container are not ready yet, append on body, sidebar pusher will take everything in body and put in on pusher
            var container: JQuery = $(model.UI.MAIN_CONTAINER).length ? $(model.UI.MAIN_CONTAINER) : $(document.body);
            container.append(Handlebars.templates[this.hbTemplate](context));

            this.jDom = $(this.hbClassName).last();

            return this.jDom;
        }
    }
}
