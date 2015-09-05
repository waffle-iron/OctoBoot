/// <reference path="../core/Socket.ts" />

module OctoBoot.model {

    export class ServerAPI {

        public static IS_LOGGED: string = '/api/isLogged/:sid';
        public static GITHUB_LOGIN: string = '/api/GitHubApi/:sid';

        public static getProjectPath(projectName: string): string {
			return '/temp/' + core.Socket.sid + '/' + projectName + '/'
        }

        public static getTemplatePath(name: string): string {
			return 'templates/' + name + '/'
        }
    }
}
