/// <reference path="../definition/socket.io-client.d.ts" />

module OctoBoot.core {

    export class Socket {

        public static io: SocketIOClient.Socket;

        public static init(): any {
            this.io = io("http://" + window.location.host);

            return {
                then: (done: (sid: number) => any) => {
                    this.io.on("sid", done);
                }
            }
        }
    }
}
