module OctoBoot.model {

    export interface GitHubRepo {
        id: number;
        owner: {
            login: string;
            id: number;
            avatar_url: string;
            gravatar_id: string;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean
        };
        name: string;
        full_name: string;
        description: string;
        private: boolean;
        fork: boolean;
        url: string;
        html_url: string;
        clone_url: string;
        git_url: string;
        ssh_url: string;
        svn_url: string;
        mirror_url: string;
        homepage: string;
        language: string;
        forks_count: number;
        stargazers_count: number;
        watchers_count: number;
        size: number;
        default_branch: string;
        open_issues_count: number;
        has_issues: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_downloads: boolean;
        pushed_at: string;
        created_at: string;
        updated_at: string;
        permissions: {
            admin: boolean;
            push: boolean;
            pull: boolean;
        }
    }

    export var GitHubRepoTemplate = (extendParams?: any): GitHubRepo => {
        return $.extend({
            id: 0,
            owner: {
                login: '',
                id: 0,
                avatar_url: '',
                gravatar_id: '',
                url: '',
                html_url: '',
                followers_url: '',
                following_url: '',
                gists_url: '',
                starred_url: '',
                subscriptions_url: '',
                organizations_url: '',
                repos_url: '',
                events_url: '',
                received_events_url: '',
                type: '',
                site_admin: true
            },
            name: '',
            full_name: '',
            description: '',
            private: true,
            fork: true,
            url: '',
            html_url: '',
            clone_url: '',
            git_url: '',
            ssh_url: '',
            svn_url: '',
            mirror_url: '',
            homepage: '',
            language: '',
            forks_count: 0,
            stargazers_count: 0,
            watchers_count: 0,
            size: 0,
            default_branch: '',
            open_issues_count: 0,
            has_issues: true,
            has_wiki: true,
            has_pages: true,
            has_downloads: true,
            pushed_at: '',
            created_at: '',
            updated_at: '',
            permissions: {
                admin: true,
                push: true,
                pull: true
            }
        }, extendParams);
    }

    export var RepoType = {
        PUBLIC: 'public',
        PRIVATE: 'private'
    }
}
