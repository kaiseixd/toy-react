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

export function isSameNode(oldNode, newNode) {
  if (oldNode.type !== newNode.type) {
    return false;
  }

  if (newNode.type === '#text') {
    if (newNode.content !== oldNode.content) {
      return false;
    }
  }

  if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
    return false;
  }

  for (let p in newNode.props) {
    if (newNode.props[p] !== oldNode.props[p]) {
      return false;
    }
  }

  return true;
}