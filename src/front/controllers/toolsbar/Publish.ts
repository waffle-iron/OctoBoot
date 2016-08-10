module OctoBoot.controllers.toolsbar {

    interface PublishMethod {
        icon: string
        title: string
        desc: string
        button_event: model.HTMLEvent
        button_icon: string
        button_txt: string
    }

    export class Publish extends Handlebar {

        public methods: Array<PublishMethod> = [
            {
                icon: 'large black github',
                title: 'GitHub',
                desc: 'https://yourname.github.io/YourProject/',
                button_event: {
                    click: () => this.github()
                },
                button_icon: 'cloud upload',
                button_txt: 'Publish'
            },
            {
                icon: 'large black sitemap',
                title: 'Custom FTP',
                desc: 'https://yourdomain.com',
                button_event: {
                    click: () => this.ftp()
                },
                button_icon: 'cloud upload',
                button_txt: 'Publish'
            },
            {
                icon: 'large black download',
                title: 'Download',
                desc: 'my_website.zip',
                button_event: {
                    click: () => this.download()
                },
                button_icon: 'download',
                button_txt: 'Download .zip'
            }
        ]

        private owner: string
        private ghpage: string
        private pname: string

        constructor(public url: string) {
            super(model.UI.HB_PUBLISH)

            let match: RegExpMatchArray = url.match(/github\.com\/(.+)\/(.+)\.git/)
            this.owner = match[1].toLowerCase()
            this.pname =  match[2]
            this.ghpage = 'https://' + this.owner + '.github.io/' + this.pname + '/'

            this.methods[0].desc = this.ghpage

            this.initWithContext(this).modal({
                closable: true
            })
        }

        public show(): void {
            this.jDom.modal('show')
        }

        public download(): void {
            this.jDom.modal('hide')
            window.open(this.url.replace('.git', '/archive/master.zip'), '_blank')
        }

        private github(): void {
            var unlisten: Function
            new Alert({
                title: model.UI.PUBLISH_ALERT_TITLE,
                body: model.UI.PUBLISH_ALERT_BODY,
                onApprove: () => {

                    new Alert({
                        title: 'Publishing',
                        body: 'Please wait, publication is ongoing',
                        icon: 'notched circle loading'
                    })

                    // start to check Last-Modified property on url
                    unlisten  = helper.Url.on_modified(this.ghpage + 'index.html', () => {
                        new Alert({
                            title: 'Publish success !',
                            icon: 'checkmark',
                            link: this.ghpage,
                            timestamp: Date.now(),
                            onApprove: () => { }
                        })
                    })

                    core.Socket.emit(model.ServerAPI.SOCKET_PUBLISH, { name: this.pname, url: this.url }, (error: string) => {
                        if (error) {
                            unlisten() // stop to check Last-Modified on url because of publish error
                            new Alert({
                                title: 'Publish error !',
                                body: error,
                                onApprove: () => { }
                            })
                        }
                    })

                },
                onDeny: () => {
                    if (unlisten) {
                        unlisten()
                    }
                }
            })
        }

        private ftp(): void {
            var config_hbs: JQuery = new Handlebar(model.UI.HB_PUBLISH_FTP).initWithContext().modal({
                closable: true,
                onApprove: () => {

                    var wait: Alert = new Alert({
                        title: 'Publishing',
                        body: 'Please wait, publication is ongoing. This operation can take a while if your have a big project',
                        icon: 'notched circle loading',
                        progress: true
                    })
                    var pro: JQuery = wait.jDom.find('.progress')

                    core.Socket.emit(model.ServerAPI.SOCKET_PUBLISH_FTP, {
                        name: this.pname,
                        host: config_hbs.find('input[name=host]').val(),
                        user: config_hbs.find('input[name=user]').val(),
                        password: config_hbs.find('input[name=pass]').val(),
                        port: config_hbs.find('input[name=port]').val(),
                        rpath: config_hbs.find('input[name=rpath]').val()
                    }, (data: any) => {

                        if (data.error || data.success) {
                            new Alert({
                                title: data.error ? 'Publish error !' : 'Publish success !',
                                body: data.error || 'Your publication is successful',
                                icon: data.error ? 'remove' : 'checkmark',
                                onApprove: () => { }
                            })
                        } else if (data.total) {
                            pro.progress({total: data.total})
                        } else if (data.inc) {
                            pro.progress('increment')
                        }

                    }, false)



                }
            }).modal('show')
        }
    }
}
