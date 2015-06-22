/// <reference path="Handlebar.ts" />

module OctoBoot.controllers {

    export class Toolsbar extends Handlebar {

        constructor() {
            super(model.UI.HB_TOOLSBAR);
            this.initWithContext(null);
        }

    }
}
