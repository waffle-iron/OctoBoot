/// <reference path="../Plugins.ts" />
/// <reference path="../../controllers/Alert.ts" />
/// <reference path="../../helper/Dom.ts" />

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
            this.checkForLib({
                name: 'jQuery',
                propToCheck: !!this.win['$'],
                libToAppend: this.libJQuery,
                done: () => {

                    this.checkForLib({
                        name: 'Semantic',
                        propToCheck: !!this.win['$'](this.doc.body).accordion,
                        libToAppend: this.libSemantic,
                        done: () => {
                            
                            let dirToInspect = this.stage.baseUrl.split('/').pop() + '/' + this.stage.url.split('/')[1];
                            core.Socket.emit(model.ServerAPI.SOCKET_LIST_FILES, { dir: dirToInspect }, (data: string[]) => {
                                this.addPlugin(cbk, data)
                            });

                        },
                        deny: () => cbk('')
                    })

                },
                deny: () => cbk('')
            })
        }

        private addPlugin(cbk: (plugin_html: string) => any, fileList: string[]): void {
            let alert: controllers.Alert = new controllers.Alert({
                title: 'Plugin Image zoom',
                body: 'Please select an larger image OR leave blank to use the same image',
                input: 'Title',
                dropdown: fileList.filter((v: string) => { return !!v.match(/\.(JPG|JPEG|jpg|jpeg|png|gif)+$/) }),
                icon: 'zoom',
                closable: false,
                onApprove: () => {

                    let title: string = helper.Dom.encodeString(alert.getInputValue());
                    let url: string = alert.getDropdownValue();
                    let html: string = $(this.doc).find('.modal.imagezoom').length ? '' : new controllers.Handlebar('ImagezoomInline.hbs').getHtml({});

                    this.checkForLib({
                        name: 'Plugin Image Zoom',
                        propToCheck: 'imagezoom',
                        libToAppend: [this.libImageZoom],
                        done: () => {

                            $(this.currentElement).attr('onmouseover', "OctoBoot_plugins.imagezoom(this,'" + title + "','" + url + "')");
                            cbk(html);

                        },
                        deny: () => cbk(''),
                        copyFilesInProject: ['imagezoom/image.zoom.js']
                    })

                },
                onDeny: () => { this.placeholder.remove() }
            })
        }

        public filterElement(el: HTMLElement, cbk: () => any): void {
            if ($(el).attr('onmouseover') && $(el).attr('onmouseover').indexOf('OctoBoot_plugins.imagezoom') === 0) {
                new controllers.Alert({
                    title: 'Plugin Image Zoom - Already Exist!',
                    body: 'Plugin Image Zoom already exist on this element, click on OK to REMOVE it, or click on CANCEL to MODIFY it',
                    onApprove: () => {
                        $(el).removeAttr('onmouseover');
                        this.placeholder.remove();
                    }, 
                    onDeny: () => cbk()
                })
            } else {
                cbk()
            }
        }

    }
}