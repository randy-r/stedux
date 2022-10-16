import { Component, h } from '@stencil/core';

@Component({
  tag: 'ui-jumbo',
  styleUrl: 'ui-jumbo.css',
  shadow: true,
})
export class UiJumbo {
  render() {
    return (
      <span>
        <slot></slot>
      </span>
    );
  }
}
