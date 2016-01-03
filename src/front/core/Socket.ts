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
            if (data) {
                data.sid = this.sid;
            }

            this.io.emit(event, data || { sid: this.sid });
            if (done) {
                this.io.once(event, done); 
            }
        }
    }
}
