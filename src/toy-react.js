import { isObject, merge } from './utils';

const RENDER_TO_DOM = Symbol('render to dom');

const eventRegExp = /^on(.+)$/;
const attributeMap = {
  className: 'class'
};

class ElementWrapper {
  constructor(tagName) {
    this.root = document.createElement(tagName);
  }

  setAttribute(key, value) {
    if (key.match(eventRegExp)) {
      const eventName = key.replace(eventRegExp, (_, p1) => p1[0].toLowerCase() + p1.slice(1));
      this.root.addEventListener(eventName, value);
    } else {
      this.root.setAttribute(attributeMap[key] || key, value);
    }
  }

  appendChild(component) {
    let range = document.createRange();
    // move to end
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);

    component[RENDER_TO_DOM](range);
  }

  [RENDER_TO_DOM](range) {
    // remove selected range content
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(text) {
    this.root = document.createTextNode(text);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

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

  reRender() {
    let oldRange = this._range;

    let newRange = document.createRange();
    // insert before oldRange's start
    newRange.setStart(oldRange.startContainer, oldRange.startOffset);
    newRange.setEnd(oldRange.startContainer, oldRange.startOffset);
    this[RENDER_TO_DOM](newRange);

    // update oldRange's start after insert
    oldRange.setStart(newRange.endContainer, newRange.endOffset);
    oldRange.deleteContents();
  }

  setState(newState) {
    if (!isObject(this.state)) {
      this.state = newState;
      this.reRender();
      return;
    }

    merge(this.state, newState);
    this.reRender();
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    // createElement(...)
    this.render()[RENDER_TO_DOM](range);
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