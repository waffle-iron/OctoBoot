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
	}
}
