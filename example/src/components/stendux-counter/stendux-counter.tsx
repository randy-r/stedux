import { Component, h } from '@stencil/core';

@Component({
  tag: 'stendux-counter',
  styleUrl: 'stendux-counter.css',
  shadow: true,
})
export class StenduxCounter {
  render() {
    return (
      <div>
        <ui-btn>-</ui-btn>
        <span>0</span>
        <ui-btn>+</ui-btn>
      </div>
    );
  }
}
