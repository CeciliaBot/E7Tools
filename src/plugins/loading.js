import '@/styles/loading.css'
var el;
var loading = {
    ask: (title, message, buttons, callback) => {
        let modal = new Modal(title, message, buttons || ['Cancel'], callback);
        modal.showCallback(callback)
    },
    askPromise: (title, message, buttons) => {
        let modal = new Modal(title, message, buttons || ['Cancel']);
        let preventClosing = false;
        return new Promise( (resolve, reject) => {
            modal.showPromise().then((res) => {
                if (buttons[res[0]] && buttons[res[0]].preventClosing) preventClosing = true
                resolve(res)
            }).catch(err => {
                reject(err)
            }).finally(()=> {
                if (!preventClosing) modal.remove();
            })
        })
    },
    install: (app) => {
        let domEl = document.createElement( 'div' );
        domEl.className='noselect loading-container animatefade';
        domEl.oncontextmenu = (e) => e.preventDefault();
        document.body.appendChild(domEl)

        app.config.globalProperties.$callbackAlert = callbackAlert.ask;
        app.config.globalProperties.$promiseAlert = callbackAlert.askPromise;
    }
};
window.$callbackAlert = loading.active;
export default loading;