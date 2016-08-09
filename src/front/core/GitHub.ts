/// <reference path="../model/GitHubUser.ts" />
/// <reference path="../model/GitHubRepo.ts" />
/// <reference path="../model/GitHubBranch.ts" />
/// <reference path="../model/GitHubTree.ts" />
/// <reference path="../model/GitHubLinkHeader.ts" />
/// <reference path="../definition/jquery.d.ts" />
/// <reference path="../model/ServerApi.ts" />

module OctoBoot.core {

    export class GitHub {

        private static ghapi: string = 'https://api.github.com';
        private static user: model.GitHubUser;

        public static gat: string = '';

        public static getApiUrl(): string {
            return this.ghapi + '/repos/' + this.user.login + '/';
        }

        public static cloneOnServer(name: string, url: string, done: (error: string) => any): void {
            Socket.emit(model.ServerAPI.SOCKET_CLONE, { name: name, url: url }, done);
        }

        public static getRepos(type: string, done: (repos: Array<model.GitHubRepo>) => any ): void {
            $.getJSON(this.ghapi + '/user/repos', {
                sort: 'created',
                type: type,
                access_token: this.gat,
                per_page: 100
            })
            .done(GitHub.pagination(done))
            .fail(this.throwError);
        }

        public static createRepo(name: string, done: (repo: model.GitHubRepo) => any): void {
            this.postJSON(this.ghapi + '/user/repos', {
                name: name,
                auto_init: true
            })
            .done(done)
            .fail(this.throwError);
        }

        public static deleteRepo(name: string, done: () => any): void {
            $.ajax(this.getApiUrl() + name, {
                type: 'DELETE',
                headers: { 'Authorization': 'token ' + this.gat }
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
            .done(GitHub.pagination(done))
            .fail(this.throwError);
        }

        public static getTree(repo: string, done: (tree: model.GitHubTree) => any, branch: string = 'master'): void {
            this.getBranch(repo, (branch: model.GitHubBranch) => {
                $.getJSON(this.getApiUrl() + repo + '/git/trees/' + branch.commit.sha, {
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
                type: 'POST',
                headers: { 'Authorization': 'token ' + this.gat },
                contentType: 'application/json',
                processData: false,
                data: JSON.stringify(json)
            });
        }

        private static throwError(jqxhr: JQueryXHR, status: string, error: any): void {
            new controllers.Alert({
                title: 'GitHub API Error',
                body: error,
                onApprove: () => {}
            })
        }

        /*
         * pagination()
         *
         * GitHub API pagination
         * if we have trunkated data, and so link header, continue to store data
         */
        private static pagination(done: (datas: Array<any>) => any): (datas: Array<any>, status: string, xhr: JQueryXHR) => any {
            var acc_datas: Array<any> = []
            var checkPagination = (datas: Array<any>, status: string, xhr: JQueryXHR) => {
                acc_datas = datas.concat(acc_datas)
                var links = xhr.getResponseHeader('Link');
                if (links && GitHub.parse_link_header(links).next) {
                    $.getJSON(GitHub.parse_link_header(links).next).done(checkPagination).fail(this.throwError);
                } else {
                    done(acc_datas)
                }
            }

            return checkPagination
        }


        /*
         * parse_link_header()
         *
         * Parse the Github Link HTTP header used for pageination
         * http://developer.github.com/v3/#pagination
         */
        private static parse_link_header(header: string): model.GitHubLinkHeader {
            if (header.length == 0) {
                throw new Error("input must not be of zero length");
            }

            // Split parts by comma
            var parts: Array<string> = header.split(',');
            var links: model.GitHubLinkHeader = {};
            // Parse each part into a named link
            parts.forEach(function(p) {
                var section = p.split(';');
                if (section.length != 2) {
                    throw new Error("section could not be split on ';'");
                }
                var url = section[0].replace(/<(.*)>/, '$1').trim();
                var name = section[1].replace(/rel="(.*)"/, '$1').trim();
                links[name] = url;
            });

            return links;
        }
    }
}
