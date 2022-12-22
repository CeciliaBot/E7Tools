//import Worker from 'worker-loader!./worker1.js'
var camperino;

var resolves = {};
var rejects = {};
var onupdate = {};
let globalMsgId = 0;

function camperinoCalculate (payload, callback) {
  if (!camperino)
    restartWorker();
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
  const {id, error, update, data} = msg.data;
  if (data) {
    const resolve = resolves[id]
    resolve(data)
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
};

function newWorker() {
    resolves = {};
    rejects = {};
    onupdate = {};
    globalMsgId = 0;
    //camperino = new Worker;
    camperino = new Worker(new URL('./worker.js', import.meta.url));
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
    if (camperino)
        camperino.terminate();
    camperino = null;
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