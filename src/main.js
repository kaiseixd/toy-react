import { createElement, Component, render } from './toy-react'

class MyComponent extends Component {
  render() {
    return <div>
      <h1>my component</h1>
      <span>{ this.children }</span>
    </div>
  }
}

const React = {
  createElement
}

render(<MyComponent id="a" class="c">
<div>abc</div>
<div>
  <div>22</div>
</div>
<div></div>
</MyComponent>, document.body)
