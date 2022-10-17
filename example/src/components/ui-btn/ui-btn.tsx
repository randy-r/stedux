import { Component, h } from '@stencil/core';
import { JSXBase } from '@stencil/core/internal/stencil-public-runtime';

type Button = JSXBase.IntrinsicElements['button'];

@Component({
  tag: 'ui-btn',
  styleUrl: 'ui-btn.css',
})
export class UiBtn {
  render() {
    const self = this as Button;
    return (
      <button onClick={self.onClick}>
        <slot />
      </button>
    );
  }
}
