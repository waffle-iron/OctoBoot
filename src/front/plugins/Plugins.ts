/// <reference path="../controllers/Handlebar.ts" />
/// <reference path="instagram/Instagram.ts" />

module OctoBoot.plugins {

	export interface Plugin extends controllers.Handlebar {
		container: JQuery;
	}
}