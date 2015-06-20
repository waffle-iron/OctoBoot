/// <reference path="../model/GitHubUser.ts" />
/// <reference path="../model/GitHubRepo.ts" />
/// <reference path="../model/GitHubBranch.ts" />
/// <reference path="../model/GitHubTree.ts" />

module OctoBoot.core {

    export class GitHub {

        private static ghapi: string = 'https://api.github.com';
        private static user: model.GitHubUser;

        public static gat: string = '';

        public static getApiUrl(): string {
            return this.ghapi + '/repos/' + this.user.name + '/';
        }

        public static cloneOnServer(repo: string, done: (success: boolean) => any): void {
            Socket.io.emit('clone', { url: repo, sid: SOCKET_ID });
            Socket.io.once('cloned', done);
        }

        public static getRepos(type: string, done: (repos: Array<model.GitHubRepo>) => any ): void {
            $.getJSON(this.ghapi + '/user/repos', {
                sort: 'created',
                type: type,
                access_token: this.gat
            })
            .done(done)
            .fail(this.throwError);
        }

        public static createRepo(name: string, type: string, done: (repo: model.GitHubRepo) => any): void {
            this.postJSON(this.ghapi + '/user/repos', {
                name: name
            })
            .done(done)
            .fail(this.throwError);
        }

        public static getBranch(repo: string, done: (branche: model.GitHubBranch) => any, branche: string = 'master'): void {
            $.getJSON(this.getApiUrl() + repo + '/branches/' + branche, { access_token: this.gat })
            .done(done)
            .fail(this.throwError);
        }

        public static getAllBranch(repo: string, done: (branches: Array<model.GitHubBranch>) => any): void {
            $.getJSON(this.getApiUrl() + repo + '/branches/', { access_token: this.gat })
            .done(done)
            .fail(this.throwError);
        }

        public static getTree(repo: string, done: (tree: model.GitHubTree) => any, branch: string = 'master'): void {
            this.getBranch(repo, (branch: model.GitHubBranch) => {
                $.getJSON(this.getApiUrl() + repo + '/git/trees/' + branch.commit.sha, {
                    recursive: 1,
                    access_token: this.gat
                })
                .done(done)
                .fail(this.throwError);
            });
        }

        public static getUser(done: (user: model.GitHubUser) => any): void {
            $.getJSON(this.ghapi + '/user', { access_token: this.gat })
            .done((user: model.GitHubUser) => {
                this.user = user;
                done(user);
            })
            .fail(this.throwError);
        }

        private static postJSON(url: string, json: any): JQueryXHR {
            return $.ajax(url, {
                method: 'POST',
                headers: { 'Authorization': 'token ' + this.gat },
                contentType: 'application/json',
                processData: false,
                data: JSON.stringify(json)
            });
        }

        private static throwError(jqxhr: JQueryXHR, status: string, error: any): void {
            console.error(error);
        }
    }
}
