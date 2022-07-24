//import Worker from 'worker-loader!./worker1.js'
var camperino;

var resolves = {};
var rejects = {};
var onupdate = {};
let globalMsgId = 0;

function camperinoCalculate (payload, callback) {
  const msgId = globalMsgId++
  const msg = {
    id: msgId,
    payload
  };
  return new Promise(function (resolve, reject) {
    // save callbacks for later
    resolves[msgId] = resolve;
    rejects[msgId] = reject;
    onupdate[msgId] = callback;
    camperino.postMessage(msg)
  })
}
function handleMsg(msg) {
  const {id, error, update, risultati} = msg.data;
  if (risultati) {
    const resolve = resolves[id]
    resolve(risultati)
    // purge used callbacks
    delete resolves[id]
    delete rejects[id]
    delete onupdate[id]
  } else if (update) {
    if (onupdate[id])
      onupdate[id](update);
  } else if (error) {
    // error condition
    const reject = rejects[id]
    if (reject) {
        if (error) {
          console.log(error)
          reject(error)
        } else {
          reject('Got nothing')
        }
    }
    // purge used callbacks
    delete resolves[id]
    delete rejects[id]
    delete onupdate[id]
  }
}

var camperinoMessage = (e) => {
  handleMsg(e);
  //if (e.data.risultati)
  //  camping.methods.setResults(e.data.risultati);
};

function newWorker() {
    resolves = {};
    rejects = {};
    onupdate = {};
    globalMsgId = 0;
    //camperino = new Worker;
    camperino = new Worker(new URL('./worker1.js', import.meta.url));
    camperino.onmessage = function(e) {
        camperinoMessage(e);
    };
    //camperino.onerror = function(err) {
    //};
}
function terminateWorker() {
    Object.keys(rejects).forEach( id => { /* Reject everything ongoing with error: 0 */
      rejects[id]('operation_aborted');
      delete rejects[id];
    });
    camperino.terminate();
}
function restartWorker() {
  terminateWorker();
  newWorker();
}
export {
    newWorker,
    terminateWorker,
    restartWorker,
    camperino,
    camperinoCalculate
}