/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

module OctoBoot.plugins {

    export class Instagram extends Plugin {

        constructor() {
            super('InstagramButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {
            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Instagram - account name',
                body: 'Fill with your instagram account name, you can find it on you profile url https://www.instagram.com/[ACCOUNT_NAME]/',
                input: 'Account name',
                icon: 'instagram',
                closable: false,
                onApprove: () => {
                    let account_name: string = alert.getInputValue();
                    let html: string = new controllers.Handlebar('InstagramInline.hbs').getHtml({ account_name: account_name, iframe_id: Date.now() });
                    this.copyFileInProject('instagram/instagram.html', () => {
                        cbk(html);
                    })
                }, 
                onDeny: () => {this.placeholder.remove()}
            })
        }

    }
}