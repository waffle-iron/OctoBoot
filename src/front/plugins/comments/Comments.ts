/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

module OctoBoot.plugins {

    export class Comments extends Plugin {

        private libComments: string = 'comments.js';
        private libJQuery: string[] = ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js'];
        private libSemantic: string[] = [
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.css'
        ];

        constructor() {
            super('CommentsButton.hbs')
            this.customPlaceholder = new controllers.Handlebar('CommentsInline.hbs').initWithContext({ target: '' })
        }

        public getInline(cbk: (plugin_html: string) => any): void {
            new controllers.Alert({
                title: 'Plugin Comments',
                body: 'Add plugin comment ?',
                icon: 'comments',
                onApprove: () => {
                    this.getValue('name', (name: string) => {
                        this.getValue('email', (email: string) => {
                            let id: string = Date.now().toString()
                            let url: string = '/comments/:id/:email/:name/init'
                                                .replace(/\:id/, id)
                                                .replace(/\:email/, email)
                                                .replace(/\:name/, name)
                            $.get(url).done(() => {
                                this.appendLibs(() => {
                                    cbk(new controllers.Handlebar('CommentsInline.hbs').getHtml({id: id}))
                                })
                            }).fail(() => {
                                new controllers.Alert({
                                    title: 'Plugin Comments',
                                    body: 'Error on plugin creation',
                                    onDeny: () => this.placeholder.remove()
                                })
                            })
                        })
                    })

                },
                onDeny: () => this.placeholder.remove()
            })
        }

        private getValue(name: string, done: (value: string) => any): void {
            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Comments',
                body: 'Fill a ' + name + ' for this plugin (use for email alert)',
                input: name,
                icon: 'comments',
                onApprove: () => {
                    if (!alert.getInputValue()) return false
                    done(alert.getInputValue())
                },
                onDeny: () => this.placeholder.remove()
            })
        }

        private appendLibs(done: () => any): void {
            // copy filter.js lib to project
            this.copyFileInProject('comments/' + this.libComments, () => {
                // check if filter.js is on the window, if not, append it
                this.checkForLib({
                    name: 'Comments',
                    propToCheck: 'comments',
                    libToAppend: ['module/' + this.libComments],
                    done: () => {
                        // check if semantic is here, if not, append it
                        this.checkForLib({
                            name: 'Semantic',
                            propToCheck: !!this.stage.iframe.contentWindow['$'](this.stage.iframe.contentDocument.body).accordion,
                            libToAppend: this.libJQuery.concat(this.libSemantic).concat('module/' + this.libComments),
                            done: () => done(),
                            deny: () => this.placeholder.remove()
                        })
                    },
                    deny: () => this.placeholder.remove()
                })
            })
        }

    }
}
