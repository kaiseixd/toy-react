import { isObject, merge, isSameNode } from './utils';

const RENDER_TO_DOM = Symbol('render to dom');

const eventRegExp = /^on(.+)$/;
const attributeMap = {
  className: 'class'
};

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._range = null;
  }

  setAttribute(key, value) {
    this.props[key] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get vdom() {
    return this.render().vdom;
  }

  update() {
    let vdom = this.vdom;
    this.updateNode(this._vdom, vdom);
    this._vdom = vdom;
  }

  updateNode(oldNode, newNode) {
    if (!isSameNode(oldNode, newNode)) {
      newNode[RENDER_TO_DOM](oldNode._range);
      return;
    }
    newNode._range = oldNode._range;
    this.updateChildren(oldNode, newNode);
  }

  updateChildren(oldNode, newNode) {
    const newChildren = newNode.vchildren;
    const oldChildren = oldNode.vchildren;

    if (!newChildren || !newChildren.length) {
      return;
    }

    let tailRange = oldChildren[oldChildren.length - 1]._range;

    for (let i = 0; i < newChildren.length; i++) {
      const newChild = newChildren[i];
      const oldChild = oldChildren[i];

      if (i < oldChildren.length) {
        this.updateNode(oldChild, newChild);
      } else {
        const range = document.createRange();

        range.setStart(tailRange.endContainer, tailRange.endOffset);
        range.setEnd(tailRange.endContainer, tailRange.endOffset);
        newChild[RENDER_TO_DOM](range);
        tailRange = range;
      }
    }
  }

  setState(newState) {
    if (!isObject(this.state)) {
      this.state = newState;
      this.update();
      return;
    }

    merge(this.state, newState);
    this.update();
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type);
    this.type = type;
  }

  _setAttribute(key, value) {
    if (key.match(eventRegExp)) {
      const eventName = key.replace(eventRegExp, (_, p1) => p1[0].toLowerCase() + p1.slice(1));
      this._root.addEventListener(eventName, value);
    } else {
      this._root.setAttribute(attributeMap[key] || key, value);
    }
  }

  _appendChild(component) {
    let range = document.createRange();
    range.setStart(this._root, this._root.childNodes.length);
    range.setEnd(this._root, this._root.childNodes.length);

    component[RENDER_TO_DOM](range);
  }

  get vdom() {
    this.vchildren = this.children.map(child => child.vdom);
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._root = document.createElement(this.type);

    for (let key in this.props) {
      let value = this.props[key];
      this._setAttribute(key, value);
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }
    for (let child of this.vchildren) {
      this._appendChild(child);
    }

    replaceContent(range, this._root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = '#text';
    this.content = content;
  }

  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._root = document.createTextNode(this.content);
    replaceContent(range, this._root);
  }
}

function replaceContent(range, node) {
  // insert newNode
  range.insertNode(node);
  range.setStartAfter(node);
  // delete oldNode
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}

export function createElement(type, attributes, ...children) {
  let element;

  if (typeof type === 'string') {
    element = new ElementWrapper(type);
  } else {
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

    if (child === null) {
      continue;
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
  let range = document.createRange();
  // select child nodes
  range.selectNodeContents(parentElement);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}