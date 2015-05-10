module GHBoot.modules {

    // @See node_modules/DefinitelyTyped/handlebars/handlebars.d.ts#7
    declare var Handlebars: HandlebarsRuntimeStatic;

    export class Login {

        public template: HandlebarsTemplateDelegate;
        public html: string;
        public sid: number;

        private modalOption: any = {
            closable: false,
            onApprove: () => this.connectGitHub()
        };

        constructor() {
            this.template = Handlebars.templates[model.UI.HB_LOGIN_MODAL];
            this.html = this.template({});
        }

        public isLogged(sid: number): JQueryXHR {
            return $.get(model.ServerAPI.IS_LOGGED.replace(/:sid/, sid.toString()));
        }

        public show(sid: number): void {
            if (!this.sid) {
                $(document.body).append(this.html);
                $(model.UI.LOGIN_MODAL).modal(this.modalOption);
            }

            this.sid = sid;

            $(model.UI.LOGIN_MODAL).modal('show');
        }

        public hide(): void {
            $(model.UI.LOGIN_MODAL).modal('hide');
        }

        private connectGitHub(): boolean {
            window.open(model.ServerAPI.GITHUB_LOG.replace(/:sid/, this.sid.toString()), "", "width=1050, height=700, scrollbars=1");
            return false;
        }
    }
}
