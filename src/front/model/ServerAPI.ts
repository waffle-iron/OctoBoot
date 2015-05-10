module GHBoot.model {

    export class ServerAPI {

        public static IS_LOGGED: string = '/api/isLogged/:sid';
        public static GITHUB_LOG: string = '/api/GitHubApi/:sid';
    }
}
