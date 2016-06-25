module OctoBoot.helper {

    export class HandlebarHelper {

        private static events: any = [];

        public static register(): void {
            this.bind();
        }

        public static updateTemplate(id: string, data: any, domId?: string): void {
            var nid = this.formatId(id);
            var did: string = domId || nid;
            var html = Handlebars.templates[id](data);

            if (domId) {
                html = html.replace(nid, did);
            }

            $('.' + did).replaceWith(html);
        }

        public static formatId(hbsId: string, pre: string = '', post: string = ''): string {
            return pre + hbsId.replace(/\.hbs/ig, '') + post;
        }

        private static bind(): void {
            Handlebars.registerHelper('bind', (events: model.HTMLEvent): string => {
                if (!events) {
                    console.error('bind error, event object is null');
                } else {
                    this.events.push(events);
                    var id: number = this.events.length - 1;
                    this.bindEvent(id, events.context);
                    return 'hhb' + id
                }
            });

            Handlebars.registerHelper('AlertDrop_isImage', (uri: string): hbs.SafeString => {
                if (!uri.match) {
                    return new Handlebars.SafeString('<i class="file icon"></i>')
                } else {
                    return new Handlebars.SafeString(!!uri.match(/(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)$/) ?
                    '<img class="ui medium image" src="' + uri + '">' :
                    '<i class="file icon"></i>')
                }
            });

            Handlebars.registerHelper('AlertDrop_isImageUrl', (uri: string, nb: number): hbs.SafeString => {
                if (!uri.match) {
                    return uri
                } else {
                    return !!uri.match(/(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)$/) ?
                        uri.split('/').slice(-(nb || 2)).join('/') :
                        uri
                }
            });
        }

        private static bindEvent(id: number, context: JQuery): void {
            var o: JQuery = context ? context.find('.hhb' + id) : $('.hhb' + id);
            if (o.length) {
                for (var i in this.events[id]) {
                    o.on(i, this.events[id][i]);
                }
            } else {
                setTimeout(() => this.bindEvent(id, context), 500);
            }
        }
    }
}
