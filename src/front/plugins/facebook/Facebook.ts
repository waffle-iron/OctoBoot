/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

interface Window {
    FB: any;
    $: any;
}

module OctoBoot.plugins {

    export class Facebook extends Plugin {

        private libFacebook: string = 'facebook.plugin.js';
        private libJQuery: string[] = ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js'];
        private modify: boolean = false;

        constructor() {
            super('FacebookButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {

            this.accountName((name: string, fid: number) => {
                
                this.postNumbers((nbr: number) => {
                
                    this.appendLibs(() => {
                
                        this.waitForPlugin(() => {
                
                            let id: number = Date.now();
                            let html: string = new controllers.Handlebar('FacebookInline.hbs').getHtml({
                                id: id,
                                pid: fid,
                                nbr: nbr || 1
                            });
                            cbk(html);
                        })
                    })
                })
            })
        }

        public filterElement(el: HTMLElement, cbk: () => any): void {
            if ($(el).hasClass('ob_facebook')) {
                new controllers.Alert({
                    title: 'Plugin Facebook - Already Exist!',
                    body: 'Plugin Facebook already exist on this element, click on OK to REMOVE it, or CANCEL',
                    onApprove: () => {
                        this.currentElement.remove();
                        this.placeholder.remove();
                    },
                    onDeny: () => {}
                })
            } else if ($(el).width() < 300) {
                new controllers.Alert({
                    title: 'Plugin Facebook error - your container is to tiny !!',
                    body: 'Plugin Facebook needs more than 300px',
                    onApprove: () => this.placeholder.remove()
                })
            } else {
                cbk();
            }
        }

        private accountName(done: (name: string, fid: number) => any): void {
            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Facebook - account name',
                body: 'Please fill with your facebook account name, you can find it on you profile url https://www.facebook.com/[ACCOUNT_NAME]/',
                input: 'Account name',
                icon: 'facebook',
                closable: false,
                onApprove: () => {
                    alert.setWait()

                    this.getFacebookId(alert.getInputValue(), (fid: number) => {
                        $.get('/facebook/' + fid + '/feed', function(feeds) {
                            if (feeds.length) {
                                done(alert.getInputValue(), fid)
                            } else {
                                new controllers.Alert({
                                    title: 'Facebook plugin error - you have no public posts !',
                                    body: 'Please check on your facebook account the access policy of your post',
                                    onApprove: () => this.placeholder.remove()
                                })
                            }
                        });
                    }, () => { this.placeholder.remove() })

                    return false;
                },
                onDeny: () => { this.placeholder.remove() }
            })
        }

        private postNumbers(done: (nbr: number) => any): void {
            let list_post_number: number[] = [];
            for (var i = 1; i <= 25; i++) {
                list_post_number.push(i)
            } 

            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Facebook - Posts numbers',
                body: 'Please choose how much posts you want to display',
                dropdown: list_post_number,
                icon: 'facebook',
                closable: false,
                onApprove: () => {
                    done(parseInt(alert.getDropdownValue()))
                },
                onDeny: () => { this.placeholder.remove() }
            })
        }

        private appendLibs(done: () => any): void {
            this.checkForLib({
                name: 'Facebook library',
                propToCheck: !!this.stage.iframe.contentWindow.FB,
                libToAppend: ['module/' + this.libFacebook],
                done: () => {
                    this.checkForLib({
                        name: 'jQuery library',
                        propToCheck: !!this.stage.iframe.contentWindow.$,
                        libToAppend: this.libJQuery,
                        done: done,
                        deny: () => { this.placeholder.remove() }
                    })
                },
                deny: () => { this.placeholder.remove() },
                copyFilesInProject: ['facebook/' + this.libFacebook]
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

        private waitForPlugin(done: () => any): void {
            let inter: number = setInterval(() => {
                if (this.stage.iframe.contentWindow.OctoBoot_plugins && this.stage.iframe.contentWindow.OctoBoot_plugins.facebook_plugin) {
                    clearInterval(inter);
                    done()
                }
            }, 10);
        }

    }
}