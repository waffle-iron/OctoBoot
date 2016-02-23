/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

interface Window {
    FB: any;
}

module OctoBoot.plugins {

    export class Facebook extends Plugin {

        private tagFacebook: string = 'facebook.app.tag.js';
        private libFacebook: string = 'facebook.plugin.js';
        private modify: boolean = false;

        constructor() {
            super('FacebookButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {


            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Facebook - account name',
                body: 'Fill with your facebook account name, you can find it on you profile url https://www.facebook.com/[ACCOUNT_NAME]/',
                input: 'Account name',
                icon: 'facebook',
                closable: false,
                onApprove: () => {
                    let account_name: string = alert.getInputValue();
                    
                    this.getFacebookId(account_name, (fid: number) => {
                    
                        this.appendLibs(() => {
                            let id: number = Date.now();
                            let html: string = new controllers.Handlebar('FacebookInline.hbs').getHtml({
                                id: id,
                                pid: fid,
                                nbr: 1
                            });
                            cbk(html);
                            this.stage.iframe.contentWindow.OctoBoot_plugins.facebook_plugin(fid, this.stage.iframe.contentDocument.getElementsByClassName(id.toString())[0], 1)
                        }, () => { this.placeholder.remove() })
                    
                    }, () => { this.placeholder.remove() })

                },
                onDeny: () => { this.placeholder.remove() }
            })
        }

        /*public filterElement(el: HTMLElement, cbk: () => any): void {
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
        }*/

        private appendLibs(done: () => any, deny: () => any): void {
            this.checkForLib({
                name: 'Facebook library',
                propToCheck: !!this.stage.iframe.contentWindow.FB,
                libToAppend: ['module/' + this.tagFacebook, 'module/' + this.libFacebook],
                done: done,
                deny: deny,
                copyFilesInProject: ['facebook/' + this.tagFacebook, 'facebook/' + this.libFacebook]
            })
        }

        private getFacebookId(name: string, done: (fid: number) => any, error: () => any): void {
            $.get('/stringfromurl/' + encodeURIComponent('https://www.facebook.com/' + name), (html: string) => {
                var regid: RegExpMatchArray = html.match(/"entity_id":"(\d+)"/)

                if (regid) {
                    done(parseInt(regid[1]))
                } else {
                    new controllers.Alert({
                        title: 'Facebook plugin error',
                        body: 'error on account validation',
                        closable: false,
                        onApprove: error
                    })
                }
            })
        }

    }
}