module OctoBoot.model {

    export class ServerAPI {

        public static TEMPLATE_REPO_NAME: string = 'OctoBoot-templates';

        public static IS_LOGGED: string = '/api/isLogged/:sid';
        public static GITHUB_LOGIN: string = '/api/GitHubApi/:sid';
        public static UPLOAD: string = '/api/upload/:sid/:project/:filename'

        public static SOCKET_BIND: string = 'bind';
        public static SOCKET_ID: string = 'sid';
        public static SOCKET_COPY_TEMPLATE: string = 'cpTemplate';
        public static SOCKET_COPY_PLUGIN: string = 'cpPlugin';
        public static SOCKET_LIST_TEMPLATE: string = 'templatesList';
        public static SOCKET_LIST_DIR: string = 'dirList';
        public static SOCKET_LIST_FILES: string = 'ls';
        public static SOCKET_SAVE: string = 'save';
        public static SOCKET_PUBLISH: string = 'publish';
        public static SOCKET_CLONE: string = 'clone';
        public static SOCKET_CONVERT: string = 'convert';
        public static SOCKET_SCRAPP: string = 'scrapp';
        public static SOCKET_FILL_TEMPLATE: string = 'fill';
        public static SOCKET_REMOVE_FILE: string = 'rm';
        public static SOCKET_REMOVE_DIR: string = 'rmdir';

        public static getProjectPath(sid: number, projectName: string): string {
			return '/temp/' + sid + '/' + projectName + '/'
        }

        public static getTemplatePath(name: string): string {
			return 'templates/' + name + '/'
        }
    }
}
