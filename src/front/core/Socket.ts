/// <reference path="../definition/socket.io-client.d.ts" />

module OctoBoot.core {

    export class Socket {

        public static sid: number;
        public static io: SocketIOClient.Socket;

        private static files_weight_order = {
            html: 6,
            png: 5,
            jpg: 4,
            css: 3,
            js: 2
        };

        public static init(): any {
            this.io = io('http://' + window.location.host);
            // try to retrieve previous sid on localstorage
            // allow us to keep original user folder with repo and not re clone everything, just pull / reset
            this.sid = localStorage.getItem(model.ServerAPI.SOCKET_ID);

            return {
                then: (done: (sid: number) => any) => {
                    this.emit(model.ServerAPI.SOCKET_BIND, {}, () => {
                        this.emit(model.ServerAPI.SOCKET_ID, {}, (sid: number) => {
                            this.sid = sid;
                            localStorage.setItem(model.ServerAPI.SOCKET_ID, sid.toString());
                            done(sid);
                        })
                    })
                }
            }
        }

        public static emit(event: string, data: any, done?: (data?: any) => any, once: boolean = true): void {
            var cbk: string = event + 'all';

            if (done) {
                cbk = event + (Date.now() * Math.random()); // set a cbk event to call to execute done method on side front
                if (once) {
                    this.io.once(cbk, done);
                } else {
                    this.io.on(cbk, done);
                }
            }

            data = data || {};
            data._sid = this.sid; // socket id to identify this session
            data._scbk = cbk; // set a cbk event to call to execute done method on side front
            this.io.emit(event, data);
        }

        public static reset(): void {
            localStorage.removeItem(model.ServerAPI.SOCKET_ID);
            location.reload();
        }

        public static getFilesListFiltered(dir: string, done: (filesList: string[]) => any): void {
            this.emit(model.ServerAPI.SOCKET_LIST_FILES, { dir: dir }, (data: string[]) => {
                done(data.sort((a: string, b: string) => {
                    let aw: number = this.files_weight_order[a.split('.').pop()] || 1
                    let bw: number = this.files_weight_order[b.split('.').pop()] || 1
                    return bw - aw
                }))
            })
        }
    }
}
