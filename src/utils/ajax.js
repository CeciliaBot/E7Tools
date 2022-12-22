export default function(url, method='GET', data) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        // window.GLOBAL_BASE_URL ? url = url.replace(/^.\/data/i, window.GLOBAL_BASE_URL+'data') : null
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(data);
    });
}