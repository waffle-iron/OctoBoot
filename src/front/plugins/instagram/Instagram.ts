/// <reference path="../Plugins.ts" />

module OctoBoot.plugins {

    export class Instagram extends controllers.Handlebar implements Plugin {

    	constructor(public container: JQuery) {
    		super('InstagramButton.hbs')
    		this.initWithContext(this, container)
    	}

    }
}