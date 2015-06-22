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
            $(document.body)
                .append(Handlebars.templates[this.hbTemplate](context));

            this.jDom = $(this.hbClassName);
            return this.jDom;
        }
    }
}