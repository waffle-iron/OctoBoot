module OctoBoot.helper {

    export class Url {

        static on_modified(url: string, done: Function, timeout: number = 60000): Function {
            var stop: boolean = false
            var xhr: JQueryXHR
            var do_stop: Function = () => { stop = true }
            var timeout = setTimeout(() => {
                do_stop()
                done()
            }, timeout)

            var load: Function = (_last_modified?: string) => {
                xhr = $.get(url, (data: string) => {
                    if (_last_modified && _last_modified !== xhr.getResponseHeader('Last-Modified')) {
                        done()
                    } else if (!stop) {
                        setTimeout(() => load(_last_modified || xhr.getResponseHeader('Last-Modified')), 500)
                    }
                })
                xhr.fail(() => done())
            }

            load()
            
            return () => {
                clearTimeout(timeout)
                do_stop()
            }
        }
    }
}
