export class ElementWrapper {
  constructor(tagName) {
    this.root = document.createElement(tagName);
  }

  setAttribute(key, value) {
    this.root.setAttribute(key, value);
  }

  appendChild(component) {
    this.root.appendChild(component.root);
  }
}

class TextWrapper {
  constructor(text) {
    this.root = document.createTextNode(text);
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }

  setAttribute(key, value) {
    this.props[key] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get root() {
    if (!this._root) {
      // createElement(...).root
      this._root = this.render().root;
    }
    return this._root;
  }
}

export function createElement(type, attributes, ...children) {
  let element;

  if (typeof type === 'string') {
    element = new ElementWrapper(type);
  } else {
    // react component
    element = new type();
  }

  for (let key in attributes) {
    element.setAttribute(key, attributes[key]);
  }

  insertChildren(element, children);

  return element;
}

function insertChildren(parent, children) {
  for (let child of children) {
    if (typeof child === 'string') {
      child = new TextWrapper(child);
    }

    // this.children
    if (Array.isArray(child)) {
      insertChildren(parent, child);
    } else {
      parent.appendChild(child);
    }
  }
}

export function render(component, parentElement) {
  parentElement.appendChild(component.root);
}