/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

interface Window {
    $:JQueryStatic
}

module OctoBoot.plugins {

    export class Imagezoom extends Plugin {

        public allowedTag: string = 'IMG';
        public dragOverAction: PluginDragOverAction = PluginDragOverAction.OVER;

        private jQueryLib: string[] = ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js'];
        private semanticLib: string[] = [
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.css'
        ]

        constructor() {
            super('ImagezoomButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {
            /*let alert: controllers.Alert = new controllers.Alert({
                title: 'Instagram account name',
                body: 'Fill with your instagram account name, you can find it on you profile url https://www.instagram.com/[ACCOUNT_NAME]/',
                input: 'Account name',
                icon: 'instagram',
                onApprove: () => {
                    let account_name: string = alert.getInputValue();
                    let html: string = new controllers.Handlebar('InstagramInline.hbs').getHtml({ account_name: account_name, iframe_id: Date.now() });
                    this.copyFileInProject('instagram/instagram.html', () => {
                        cbk(html);
                    })
                }, 
                onDeny: () => {this.placeholder.remove()}
            })*/


            this.checkForLib('jQuery', this.stage.iframe.contentWindow.$, this.jQueryLib, () => {

                this.checkForLib('Semantic', this.stage.iframe.contentWindow.$(this.stage.iframe.contentDocument.body).accordion, this.semanticLib, () => {
                    console.log('ok')
                }, () => cbk(''))

            }, () => cbk(''))
        }

    }
}