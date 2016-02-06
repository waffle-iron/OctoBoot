var OctoBoot;
(function (OctoBoot) {
    var model;
    (function (model) {
        var ServerAPI = (function () {
            function ServerAPI() {
            }
            ServerAPI.getProjectPath = function (sid, projectName) {
                return '/temp/' + sid + '/' + projectName + '/';
            };
            ServerAPI.getTemplatePath = function (name) {
                return 'templates/' + name + '/';
            };
            ServerAPI.TEMPLATE_REPO_NAME = 'OctoBoot-templates';
            ServerAPI.IS_LOGGED = '/api/isLogged/:sid';
            ServerAPI.GITHUB_LOGIN = '/api/GitHubApi/:sid';
            ServerAPI.UPLOAD = '/api/upload/:sid/:project/:filename';
            ServerAPI.SOCKET_ID = 'sid';
            ServerAPI.SOCKET_COPY = 'cp';
            ServerAPI.SOCKET_LIST_TEMPLATE = 'templatesList';
            ServerAPI.SOCKET_LIST_DIR = 'dirList';
            ServerAPI.SOCKET_LIST_FILES = 'ls';
            ServerAPI.SOCKET_SAVE = 'save';
            ServerAPI.SOCKET_PUBLISH = 'publish';
            ServerAPI.SOCKET_CLONE = 'clone';
            ServerAPI.SOCKET_CONVERT = 'convert';
            ServerAPI.SOCKET_SCRAPP = 'scrapp';
            ServerAPI.SOCKET_FILL_TEMPLATE = 'fill';
            ServerAPI.SOCKET_REMOVE_FILE = 'rm';
            return ServerAPI;
        })();
        model.ServerAPI = ServerAPI;
    })(model = OctoBoot.model || (OctoBoot.model = {}));
})(OctoBoot || (OctoBoot = {}));
module.exports = OctoBoot.model.ServerAPI
