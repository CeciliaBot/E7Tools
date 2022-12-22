// For text
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea);
    textArea.focus()
    textArea.select()
  
    try {
        var successful = document.execCommand('copy');
        document.body.removeChild(textArea)
        if (successful) {
            return Promise.resolve(text)
        } else {
            return Promise.reject('Fallback copy failed')
        }
    } catch (err) {
        document.body.removeChild(textArea)
        return Promise.reject('Fallback copy failed\n'+err)
    }
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text).then( succes => {
            return Promise.resolve(succes)
        }).catch(err => {
            return Promise.reject(err)
        })
    } else {
        navigator.clipboard.writeText(text).then(function() {
            return Promise.resolve(text)
        }, function(err) {
            return Promise.reject('Could not copy: '+err)
        })
    }
}
function copyBlob(blob) {
    var data = [new ClipboardItem({ [blob.type]: blob })]
    if (navigator.clipboard)
        navigator.clipboard.write(data).then(function() {
            return Promise.resolve(data)
        }, function(err) {
            return Promise.reject('Could not copy: '+err)
        })
    else
        return Promise.reject('Blob copy failed. Your browser does not support Clipboard API.')
}
export default async function copy(data) {
    try {
        if (typeof data === 'string')
            return copyTextToClipboard(data)
        else if (data instanceof Blob) {
            return copyBlob(data)
        }
        else if (data instanceof HTMLElement && !['IMG', 'CANVAS'].includes(data.tagName)) {
            return copyTextToClipboard(data.innerHTML)
        }
        else if (data instanceof HTMLElement) {
            if (data.tagName === 'CANVAS') {
                return data.toBlob((blob) => {
                    return copyBlob(blob)
                })
            } else {
                var img = await fetch(data.src)
                var blob = await img.blob()
                return copyBlob(blob)
            }
        }
        return Promise.reject('Element type not supported')
    } catch (err) {
        console.log('Copy error', err)
        return Promise.reject(err)
    }
}