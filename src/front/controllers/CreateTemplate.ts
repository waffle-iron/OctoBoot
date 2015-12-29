/// <reference path="Alert.ts" />
/// <reference path="../core/Socket.ts" />
/// <reference path="../model/ServerApi.ts" />

module OctoBoot.controllers {

    export class CreateTemplate {

        private alert: Alert;

        constructor() {
            this.alert = new Alert({
                title: 'Template url',
                onApprove: () => this.get_template(this.alert.getInputValue()),
                onDeny: () => { return true },
                icon: 'world',
                input: 'http://...'
            });
        }

        private get_template(url: string): boolean {
            this.alert.setWait();
            core.Socket.emit(model.ServerAPI.SOCKET_SCRAPP, { url: url }, (data: string) => {
                if (data) {
                    this.alert.hide();
                    this.alert = new Alert({
                        title: 'Preview - Set template name',
                        onApprove: () => {},
                        onDeny: () => { return true },
                        iframe: data,
                        input: 'name...'
                    });
                }
            })

            return false
        }

    }
}
