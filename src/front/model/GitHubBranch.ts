module OctoBoot.model {

    export interface GitHubBranch {
        name: string;
        commit: {
            sha: string;
            commit: {
                author: {
                    name: string;
                    date: string;
                    email: string;
                };
                url: string;
                message: string;
                tree: {
                    sha: string;
                    url: string;
                };
                committer: {
                    name: string;
                    date: string;
                    email: string;
                };
            };
            author: {
                gravatar_id: string;
                avatar_url: string;
                url: string;
                id: number;
                login: string;
            };
            parents: [
                {
                    sha: string;
                    url: string;
                }
            ];
            url: string;
            committer: {
                gravatar_id: string;
                avatar_url: string;
                url: string;
                id: number;
                login: string;
            }
        };
        _links: {
            html: string;
            self: string;
        }
    }
}
