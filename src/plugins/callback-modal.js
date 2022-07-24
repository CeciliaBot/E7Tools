/* 
    Can be used as promise or with callback function:
        Promise => this.$promiseAlert or window.$promiseAlert
        Callback => this.$callbackAlert or window.$callbackAlert

    Arguments:
        title, => Title of the alert prompt
        body, => Message inside the modal can be a string or HTML as string, or a Promise that must return HTML or function that returns HTML
        buttons, => Array of strings or Array of objects. Pass a button as Object for more customization ex: {name: 'Cancel', class: 'color-red', style: 'font-size: 10px'}
        callback => For $callbackAlert only
    
    Returns:
        Promise:
            Array [index of the pressed button, modal DOM]
        Callback:
            index, => Index of the button pressed
            e, => Click event
            DOM, => DOM node of the modal
            Object: {
                preventClosing, => prevents the modal from closing itself
                checkInputs => Check if all required inputs have been filled
            }
*/

class Modal {
    constructor(title, body, buttons, callback) {
        if (!callback || !(callback instanceof Function)) {
            this.isPromise = true
        } else {
            this.isPromise = false
        }

        this.parentNode = document.createElement( 'div' );
        this.parentNode.className = 'center-modal';
        this.parentNode.style.zIndex=999;

            let modalBody = document.createElement( 'div' )
            modalBody.className = 'flat-modal'
            modalBody.style.textAlign = 'center'

                let titleEl = document.createElement( 'h1' );
                titleEl.innerHTML = title;
                titleEl.className = 'm-window-title';
                modalBody.appendChild( titleEl );

                let modalInner = document.createElement( 'div' )
                modalInner.style = 'display: flex;flex-direction: column;';

                    /* Add buttons */
                    let modalButtons = document.createElement( 'div' );
                    modalButtons.style.padding = '10px';
                    buttons.forEach( (button, i) => {
                        let buttonEl = document.createElement( 'BUTTON' );
                        buttonEl.style.width = '40%';
                        if (button instanceof Object) {
                            buttonEl.className = button.class || 'flat-button material-button primary';
                            buttonEl.innerText = button.name;
                            buttonEl.style += button.style;
                        } else {
                            buttonEl.innerText = button;
                            buttonEl.className = 'flat-button material-button basic primary';
                        }
                        buttonEl.ontouchstart = window.$ripple;
                        buttonEl.onmousedown = window.$ripple;
                        buttonEl.onclick = (e) => {
                            this.buttonClicked(i,e)
                        };
                        modalButtons.appendChild( buttonEl );
                    });
                    modalInner.appendChild( modalButtons );

                    /* Set the requested body */
                    let modalContent = document.createElement( 'div' );
                    modalContent.style = 'flex: 1; overflow: auto;';
                    if (typeof body === 'object' && typeof body.then === 'function') {
                        modalButtons.style.display = 'none' // hide buttons
                        modalContent.innerHTML = '<div class="infinite-loading-wrapper" style=""><div class="infinite-loading"></div></div>'; // loading animation
                        body.then( (returnedBody) => {
                            if ( document.body.contains(modalContent) )
                                modalContent.innerHTML = returnedBody;
                        }).catch( (err) => {
                            if ( document.body.contains(modalContent) )
                                modalContent.innerHTML = '<div>Error' + (err? '<br>'+err:'') + '</div>';
                        }).finally( () => {
                            if ( document.body.contains(modalContent) )
                                modalContent.style.padding = '10px',
                                modalButtons.style.display = '';
                        })
                    } else if (body instanceof Function) {
                        modalContent.stye.padding = '10px';
                        modalContent.innerHTML = body();
                    } else {
                        modalContent.style.padding = '10px';
                        modalContent.innerHTML = '<div style="padding: 10px;">'+body+'</div>';
                    }
                    modalInner.insertBefore( modalContent, modalButtons );

                modalBody.appendChild( modalInner );

            this.parentNode.appendChild( modalBody );
        document.body.appendChild( this.parentNode );
    }
    buttonClicked (i,e) {
        let prevent;
        function preventClosing() {
            prevent=true;
        }
        let checkInputs = () => {
            let getInputs = this.parentNode.querySelectorAll('input');
            for (var j=0;j<getInputs.length;j++) {
                let input = getInputs[j];
                if (input.getAttribute('required') && !input.value)
                    return false;
            }
            return true;
        }
        if (this.isPromise) {
            if (!checkInputs) return;
            this.resolveFunction([i, this.parentNode])
        } else {
            this.callback(i, e, this.parentNode, {preventClosing: preventClosing, checkInputs: checkInputs})
            if (!prevent) this.remove()
        }
    }
    async showCallback (callback) {
      this.parentNode.classList.add( 'show' );
      this.callback = callback;
    }
    async showPromise () {
        this.parentNode.classList.add( 'show' );
        return new Promise( (resolve, reject) => {
          this.resolveFunction = resolve;
          this.rejectFunction = reject;
        });
    }
    async remove() {
        this.parentNode.remove();
    }
}

const callbackAlert = {
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
        app.config.globalProperties.$callbackAlert = callbackAlert.ask;
        app.config.globalProperties.$promiseAlert = callbackAlert.askPromise;
    }
};
window.$callbackAlert = callbackAlert.ask; /* Available everywhere by calling $promiseAlert()*/
window.$promiseAlert = callbackAlert.askPromise;
export default callbackAlert;