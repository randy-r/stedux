import { Component, Event, h } from '@stencil/core';

@Component({
  tag: 'ui-btn',
  styleUrl: 'ui-btn.css',
  shadow: true,
})
export class UiBtn {
  @Event() click?: (event: MouseEvent) => void;

  render() {
    return (
      <button onClick={this.click}>
        <slot />
      </button>
    );
  }
}
