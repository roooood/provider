const limit = (arr, data, len) => {
    arr.unshift(data);
    if (arr.length > len) {
        arr.pop();
    }
}
const random = (min, max) => {
    return Math.floor(Math.random() * max) + min;
}
const toggle = (arr, item) => {
    var idx = arr.findIndex(e => e.userId == item.userId);
    if (idx !== -1) {
        arr.splice(idx, 1);
        return false;
    } else {
        arr.unshift(item);
        return true;
    }
}

module.exports = {
    limit,
    random,
    toggle
}