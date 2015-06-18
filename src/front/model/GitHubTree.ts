module OctoBoot.model {

    export interface GitHubTree {
        sha: string;
        url: string;
        tree: Array<GitHubTreeFile>;
        truncated: boolean;
    }

    export interface GitHubTreeFile {
        path: string;
        mode: string;
        type: string;
        size: number;
        sha: string;
        url: string;
    }
}
