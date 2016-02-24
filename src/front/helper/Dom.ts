module OctoBoot.helper {

    export class Dom {

        static hasParent(child: Element, parent: Element): boolean {
            let result: boolean;
            let target: Element = child;
            
            if (parent) {
                while (parent && target !== parent.ownerDocument.body) {
                    result = target === parent;
                    if (result) {
                        return true
                    } else if (target.parentElement) {
                        target = target.parentElement
                    } else {
                        return false
                    }
                }
            }
            

            return false
        }

        static mouseIsOverElement(event: MouseEvent, element: Element): boolean {
            if (element) {
                var rect: ClientRect = element.getBoundingClientRect();
                return event.x >= rect.left && event.x <= rect.right && event.y >= rect.top && event.y <= rect.bottom
            } else {
                return false
            }
            
        }

        static setItemActive(jDom: JQuery, wich: string): void {
            jDom.children('.item.active').removeClass('active');
            jDom.children('.item.' + wich).addClass('active');
        }

        static setIconLoading(jDom: JQuery, wich: Array<string>, loading: boolean = true): void {
            jDom.find((loading ? '.' + wich.join('.') : '.spinner.loading') + '.icon')
                .removeClass(loading ? wich.join(' ') : 'spinner loading')
                .addClass(loading ? 'spinner loading' : wich.join(' '));
        }

        static encodeString(str: string): string {
            return str.replace(/"/g, '&#34;').replace(/'/g, '&#39;');
        }

        static formatDocumentToString(doc: Document, applyDepthOnRelativeUrl?: string): string {
            // convert iframe html to string
            var content: string = new XMLSerializer().serializeToString(doc)

            // manage special case (css / js / img editing)
            if (doc.body.childElementCount === 1) {
                switch (doc.body.children[0].tagName.toUpperCase()) {
                    case 'PRE':
                        // if body have just one child and it's a pre, we are editing a css / js file so select pre text()
                        content = $(doc.body.children[0]).text()
                        break;

                    case 'IMG':
                        // if body have just one child and it's a img, we are looking an image in iframe s don't save anything
                        content = ''
                        break;
                }
            } else if (content.match('<div class="octofont">404</div>')) {
                // if current document is a 404 octoboot html file, don't save anything
                content = ''
            }

            // clean
            content = content
                .replace(/(\sclass="")/, '') // clean html string from edition misc
                .replace(/\n\n\n/ig, ''); // remove extras linebreak

            if (applyDepthOnRelativeUrl) {
                var urls: RegExpMatchArray = content.match(/(?:src|href)="([\w\/]+\.\w+)"/ig)
                urls.forEach((url: string) => {
                    if (url.indexOf('"http') !== 0) {
                        content = content.replace(url, url.replace('="', '="' + applyDepthOnRelativeUrl))
                    }
                })
            }

            return content
        }
    }
}
