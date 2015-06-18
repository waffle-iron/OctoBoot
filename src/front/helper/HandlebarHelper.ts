module GHBoot.helper {

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
            Handlebars.registerHelper('bind', (events: any): string => {
                if (!events) {
                    console.error('bind error, event object is null');
                } else {
                    this.events.push(events);
                    var id: number = this.events.length - 1;
                    console.log('bind event', id, events);
                    this.bindEvent(id);
                    return 'hhb' + id
                }
            });
        }

        private static bindEvent(id: number): void {
            var o: JQuery = $('.hhb' + id);
            if (o.length) {
                console.log('bindEvent success', id);
                for (var i in this.events[id]) {
                    o.on(i, this.events[id][i]);
                }
            } else {
                console.log('bindEvent retry', id);
                setTimeout(() => this.bindEvent(id), 500);
            }
        }
    }
}
