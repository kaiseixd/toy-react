export function isObject(value) {
  return value !== null && typeof value === 'object';
}

export function merge(oldState, newState) {
  for (let p in newState) {
    if (!isObject(oldState[p])) {
      oldState[p] = newState[p];
    } else {
      merge(oldState[p], newState[p]);
    }
  }
}
