module OctoBoot.model {

    export interface HTMLEvent {
        click?: (e: MouseEvent) => any;
        keyup?: (e: KeyboardEvent) => any;
        context?: JQuery;
        focus?: (e: FocusEvent) => any;
        mouseover?: (e: MouseEvent) => any;
        mouseout?: (e: MouseEvent) => any;
        dragstart?: (e: DragEvent) => any;
        dragend?: (e: DragEvent) => any;
        change?: (e: Event) => any;
        // TODO ADD MORE :)
    }
}
