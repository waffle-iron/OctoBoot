/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

module OctoBoot.plugins {

    export class Instagram extends Plugin {

        private libInstagram: string = 'module/instagram.html';
        private modify: boolean = false;

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
                    let html: string = new controllers.Handlebar('InstagramInline.hbs').getHtml({ 
                        url: this.stage.applyRelativeDepthOnUrl(this.libInstagram),
                        account_name: account_name, 
                        iframe_id: Date.now()
                    });
                    this.copyFileInProject('instagram/instagram.html', () => {
                        if (!this.modify) {
                            cbk(html);
                        } else {
                            $(this.currentElement).replaceWith(html)
                            this.modify = false;
                        }
                    })
                }, 
                onDeny: () => {this.placeholder.remove()}
            })
        }

        public filterElement(el: HTMLElement, cbk: () => any): void {
            if ($(el).attr('src') && $(el).attr('src').indexOf('module/instagram.html') !== -1) {
                new controllers.Alert({
                    title: 'Plugin Instagram - Already Exist!',
                    body: 'Plugin Instagram already exist on this element, click on OK to MODIFY it, or click on CANCEL to APPEND NEW ONE after it',
                    onApprove: () => {
                        this.modify = true;
                        cbk();
                    },
                    onDeny: () => cbk()
                })
            } else {
                cbk();
            }
        }

    }
}