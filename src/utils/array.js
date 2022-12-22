export function getRandomElement(array) {
    return array[Math.floor(Math.random()*array.length)]
}

export function arrayMove(arr, old_index, new_index) {
    if (old_index < new_index) new_index--;
    if (old_index === new_index) return;
    if (old_index >= arr.length) old_index=arr.length-1;
    if (new_index >= arr.length) new_index=arr.length-1;
    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length
    }
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}