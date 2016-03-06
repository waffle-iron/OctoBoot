/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

module OctoBoot.plugins {

    export class Filter extends Plugin {

        private libFilter: string = 'filter.js';
        private libJQuery: string[] = ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js'];
        private libSemantic: string[] = [
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.css'
        ];

        constructor() {
            super('FilterButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {
            var alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Filter',
                body: 'Choose a css selector to filter, default to "article"',
                input: 'article',
                icon: 'search',
                onApprove: () => {
                    let selector: string = alert.getInputValue() || 'article'
                    cbk(new controllers.Handlebar('FilterInline.hbs').getHtml({ target: selector }))
                    this.appendLibs()
                },
                onDeny: () => this.placeholder.remove()
            })
        }

        private appendLibs(): void {
            // copy filter.js lib to project
            this.copyFileInProject('filter/' + this.libFilter, () => {
                // check if filter.js is on the window, if not, append it
                this.checkForLib({
                    name: 'Filter',
                    propToCheck: 'filter',
                    libToAppend: ['module/' + this.libFilter],
                    done: () => { 
                        // check if semantic is here, if not, append it
                        this.checkForLib({
                            name: 'Semantic',
                            propToCheck: !!this.stage.iframe.contentWindow['$'](this.stage.iframe.contentDocument.body).accordion,
                            libToAppend: this.libJQuery.concat(this.libSemantic).concat('module/' + this.libFilter),
                            done: () => { },
                            deny: () => this.placeholder.remove()
                        })
                    },
                    deny: () => this.placeholder.remove()
                })
            })
        }

    }
}