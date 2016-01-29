/// <reference path="../definition/socket.io-client.d.ts" />

module OctoBoot.core {

    export class Socket {

        public static sid: number;
        public static io: SocketIOClient.Socket;

        public static init(): any {
            this.io = io('http://' + window.location.host);

            return {
                then: (done: (sid: number) => any) => {
                    this.io.once('sid', (sid: number) => {
                        this.sid = sid;
                        done(sid);
                    });
                }
            }
        }

        public static emit(event: string, data: any, done?: (data?: any) => any): void {
            var cbk: string = event + 'all';

            if (done) {
                cbk = event + (Date.now() * Math.random()); // set a cbk event to call to execute done method on side front
                this.io.once(cbk, done);
            }

            data = data || {};
            data._sid = this.sid; // socket id to identify this session
            data._scbk = cbk; // set a cbk event to call to execute done method on side front
            this.io.emit(event, data);
        }
    }
}
