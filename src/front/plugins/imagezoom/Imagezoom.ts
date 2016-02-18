/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />

interface Window {
    $: JQueryStatic;
    imagezoom: any;
}

module OctoBoot.plugins {

    export class Imagezoom extends Plugin {

        public allowedTag: string = 'IMG';
        public dragOverAction: PluginDragOverAction = PluginDragOverAction.OVER;

        private libImageZoom: string = 'module/image.zoom.js';
        private libJQuery: string[] = ['https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js'];
        private libSemantic: string[] = [
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.7/semantic.min.css'
        ]

        constructor() {
            super('ImagezoomButton.hbs')
        }

        public getInline(cbk: (plugin_html: string) => any): void {
            this.checkForLib('jQuery', this.stage.iframe.contentWindow.$, this.libJQuery, () => {

                this.checkForLib('Semantic', this.stage.iframe.contentWindow.$(this.stage.iframe.contentDocument.body).accordion, this.libSemantic, () => {
                    
                    let dirToInspect = this.stage.baseUrl.split('/').pop() + '/' + this.stage.url.split('/')[1];
                    core.Socket.emit(model.ServerAPI.SOCKET_LIST_FILES, { dir: dirToInspect }, (data: string[]) => {
                        this.addPlugin(cbk, data)
                    });
                    

                }, () => cbk(''))

            }, () => cbk(''))
        }

        private addPlugin(cbk: (plugin_html: string) => any, fileList: string[]): void {
            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Image zoom',
                body: 'Please select an larger image OR leave blank to use the same image',
                input: 'Title',
                dropdown: fileList.filter((v: string) => { return !!v.match(/\.(JPG|JPEG|jpg|jpeg|png|gif)+$/) }),
                icon: 'zoom',
                onApprove: () => {

                    let title: string = alert.getInputValue();
                    let url: string = alert.getDropdownValue();
                    let html: string = $(this.stage.iframe.contentDocument).find('.modal.imagezoom').length ? '' : new controllers.Handlebar('ImagezoomInline.hbs').getHtml({});

                    this.copyFileInProject('imagezoom/image.zoom.js', () => {

                        var depth: number = this.stage.url.split('/').length - 3; // remove project and file name
                        var lib: string = this.libImageZoom;

                        for (var i: number = 0; i < depth; i++) {
                            lib = '../' + lib
                            if (url) {
                                url = '../' + url 
                            }
                        }

                        this.checkForLib('Plugin Image Zoom', this.stage.iframe.contentWindow.imagezoom, [lib], () => {

                            $(this.currentElement).attr('onmouseover', "imagezoom(this,'" + title + "','" + url + "')");
                            cbk(html);

                        }, () => cbk(''));

                    })
                },
                onDeny: () => { this.placeholder.remove() }
            })
        }

    }
}