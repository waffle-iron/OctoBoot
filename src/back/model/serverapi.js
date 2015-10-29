/// <reference path="../definition/socket.io-client.d.ts" />
var OctoBoot;
(function (OctoBoot) {
    var core;
    (function (core) {
        var Socket = (function () {
            function Socket() {
            }
            Socket.init = function () {
                var _this = this;
                this.io = io('http://' + window.location.host);
                return {
                    then: function (done) {
                        _this.io.once('sid', function (sid) {
                            _this.sid = sid;
                            done(sid);
                        });
                    }
                };
            };
            Socket.emit = function (event, data, done) {
                if (data) {
                    data.sid = this.sid;
                }
                this.io.emit(event, data || { sid: this.sid });
                this.io.once(event, done);
            };
            return Socket;
        })();
        core.Socket = Socket;
    })(core = OctoBoot.core || (OctoBoot.core = {}));
})(OctoBoot || (OctoBoot = {}));
/// <reference path="../core/Socket.ts" />
var OctoBoot;
(function (OctoBoot) {
    var model;
    (function (model) {
        var ServerAPI = (function () {
            function ServerAPI() {
            }
            ServerAPI.getProjectPath = function (projectName) {
                return '/temp/' + OctoBoot.core.Socket.sid + '/' + projectName + '/';
            };
            ServerAPI.getTemplatePath = function (name) {
                return 'templates/' + name + '/';
            };
            ServerAPI.IS_LOGGED = '/api/isLogged/:sid';
            ServerAPI.GITHUB_LOGIN = '/api/GitHubApi/:sid';
            ServerAPI.SOCKET_COPY = 'cp';
            ServerAPI.SOCKET_LIST_TEMPLATE = 'templatesList';
            ServerAPI.SOCKET_LIST_DIR = 'dirList';
            ServerAPI.SOCKET_SAVE = 'save';
            ServerAPI.SOCKET_PUBLISH = 'publish';
            ServerAPI.SOCKET_CLONE = 'clone';
            ServerAPI.SOCKET_CONVERT = 'convert';
            return ServerAPI;
        })();
        model.ServerAPI = ServerAPI;
    })(model = OctoBoot.model || (OctoBoot.model = {}));
})(OctoBoot || (OctoBoot = {}));
module.exports = OctoBoot.model.ServerAPI
