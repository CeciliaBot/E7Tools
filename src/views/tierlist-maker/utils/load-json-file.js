export default function (file) {
    return new Promise( (resolve, reject) => {
        try {
            if (!file) throw new Error();
            var reader = new FileReader();
            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => {
                try {
                    var content = readerEvent.target.result;
                    var load = JSON.parse(content);
                    if (!['character', 'artifact'].includes(load.type)) {
                        reject({error: 2, message: 'unsupported_type'})
                    } else
                        resolve(load)
                } catch (err) {
                    reject({error: 1, message: 'parsing_error'})
                }
            }
        } catch (err) {
            reject({error: 0, message: 'no_file_provided'})
        }
    })
}