module OctoBoot.controllers {

    export class Toolsbar {

        constructor() {
            $(document.body)
                .append(Handlebars.templates[model.UI.HB_TOOLSBAR](null));
        }

    }
}
