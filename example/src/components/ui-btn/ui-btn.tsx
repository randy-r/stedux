import { Component, Fragment, h } from '@stencil/core';

@Component({
  tag: 'ui-btn',
  styleUrl: 'ui-btn.css',
  shadow: true,
})
export class UiBtn {
  render() {
    return (
      <Fragment>
        {/* @ts-ignore */}
        <button onClick={this.onClick}>
            <slot />
        </button>
      </Fragment>
    );
  }
}
