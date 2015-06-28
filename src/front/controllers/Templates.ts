/// <reference path="Handlebar.ts" />
/// <reference path="Alert.ts" />
/// <reference path="../core/Socket.ts" />

module OctoBoot.controllers {

    interface Template {
        path: string;
        min: string;
        name: string;
        event: model.HTMLEvent;
    }

    export class Templates extends Handlebar {

        public data: Array<Template>;   

        constructor() {
            super(model.UI.HB_TEMPLATES);

            core.Socket.emit('templatesList', null, (templateList: Array<string>) => {
                this.data = templateList.filter((name: string) => {
                    return !(name.indexOf('.') === 0)
                }).map((name: string) => {
                    return { path: 'templates/' + name + '/', min: 'min.jpg', name: name , event: {click: function(i: string) {
                        new Alert({
                            title: 'Enter a name for your file', 
                            /*TODO NEXT*/onApprove: () => { },
                            onDeny: true,
                            image: 'templates/' + i + '/min.jpg',
                            input: 'filename...'
                        });
                    }.bind(this, name)}}
                });
                this.initWithContext(this);
            });
        }

        public show(): void {
            this.jDom.modal('show');
        }

    }
}
