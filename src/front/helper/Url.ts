module OctoBoot.helper {

    export class Url {

        static on_modified(url: string, value: string, done: Function, timeout: number = 120000): Function {
            var stop: boolean = false
            var xhr: JQueryXHR

            var do_stop: Function = () => { stop = true }

            var timeout = setTimeout(() => {
                do_stop()
                done()
            }, timeout)

            var load: Function = () => {
                xhr = $.get(url, (data: string) => {
                    if (value === xhr.responseText) {
                        clearTimeout(timeout)
                        done()
                    } else if (!stop) {
                        setTimeout(load, 500)
                    }
                })
                xhr.fail(() => {
                    clearTimeout(timeout)
                    done()
                })
            }

            load()

            return () => {
                clearTimeout(timeout)
                do_stop()
            }
        }
    }
}
