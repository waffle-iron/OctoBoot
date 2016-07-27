interface JQuery {
    /**
     * Semantic sidebar http://semantic-ui.com/modules/sidebar.html
     */
    sidebar(action: any, value1?: any, value2?: any): JQuery;
    /**
     * Semantic modal http://semantic-ui.com/modules/modal.html
     */
    modal(action: any, value1?: any, value2?: any): JQuery;
	/**
	 * Semantic popup http://semantic-ui.com/modules/popup.html
     */
	popup(options?: any): JQuery;
    /**
     * Semantic dropdown http://semantic-ui.com/modules/dropdown.html
     */
    dropdown(options?: any, behaviorOptions?:any): JQuery;
    /**
     * Semantic accordion http://semantic-ui.com/modules/accordion.html
     */
    accordion(options?: any): JQuery;
}
