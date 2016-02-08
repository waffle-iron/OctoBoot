module OctoBoot.model {

    export interface HTMLEvent {
        click?: (e: MouseEvent) => any;
        keyup?: (e: KeyboardEvent) => any;
        context?: JQuery;
        focus?: (e: FocusEvent) => any;
        mouseover?: (e: MouseEvent) => any;
        // TODO ADD MORE :)
    }
}
