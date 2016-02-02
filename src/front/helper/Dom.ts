module OctoBoot.helper {

	export class Dom {

		static hasParent(child: Element, parent: Element): boolean {
			let result: boolean;
			let target: Element = child;

			while (target !== parent.ownerDocument.body) {
				result = target === parent;
				if (result) {
					return true
				} else if (target.parentElement) {
					target = target.parentElement
				} else {
					return false
				}
			}

			return false
		}

		static mouseIsOverElement(event: MouseEvent, element: Element): boolean {
			var rect: ClientRect = element.getBoundingClientRect();
			return event.x >= rect.left && event.x <= rect.right && event.y >= rect.top && event.y <= rect.bottom
		}
	}
}
