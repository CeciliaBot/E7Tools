// var s = {                                                                  // structure
//     year: 31536000,
//     month: 2592000,
//     week: 604800,
//     day: 86400,
//     hour: 3600,
//     minute: 60,
//     second: 1
// };

export default class CountDown {
    constructor(options = {}) {
        this.setData(options)
        this.startTimer()
    }
    setData(options) {
        this.date = options.date !== undefined ? options.date && isNaN(options.date) ? new Date(options.date).getTime() : options.date : this.date;
        this.utc = options.utc !== undefined ? options.utc : this.utc
        this.onUpdate = options.onUpdate !== undefined ? options.onUpdate : this.onUpdate || function () {}
        this.onZero = options.onZero !== undefined ? options.onZero : function () {} || function () {}
        this.interval = options.interval !== undefined ? options.interval : this.interval || 1000
    }
    startTimer() {
        !this.date ? this.clock() : this.countDown() // trigger once manually
        this.w = setTimeout( () => { // wait for the clock to be perfectly synced
            if (!this.onUpdate) return;
            if (!this.date) { // if no date is provided run as normal clock
                this.t = setInterval( () => this.clock(), this.interval)
            } else {
                this.t = setInterval( () => this.countDown(), this.interval)
            }
        }, 1000 - new Date().getMilliseconds() )
    }
    countDown() {
        var delta = (this.date - Date.now() ) / 1000;
        var result = [86400, 3600, 60, 1].map(time => {
            var r = Math.max(Math.floor( delta / time ), 0)
            delta -= time * r
            return r
        })
        this.onUpdate(result, delta)
        if (this.date-Date.now()<=0) {
            this.onZero()
        }
    }
    padNumber(n) {
        return n<10 ? '0'+n : n
    }
    clock() {
        var today = new Date();
        var h = !this.utc?today.getHours():today.getUTCHours();
        var m = this.padNumber( !this.utc?today.getMinutes():today.getUTCMinutes() );
        var s = this.padNumber( !this.utc?today.getSeconds():today.getUTCSeconds() );
        this.onUpdate([h,m,s], h+':'+m+':'+s)
    }
    $update(data, restart) {
        if (restart) {
            clearInterval(this.t)
            clearTimeout(this.w)
        }
        this.setData(data)
        if (restart)
            this.startTimer()
    }
    $destroy() {
        clearInterval(this.t)
        clearTimeout(this.w)
        this.t = null
        this.w = null
        this.interval = null
        this.onUpdate = null
        this.onZero = null
        this.date = null
        this.utc = null
    }
}