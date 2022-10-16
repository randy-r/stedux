import { Component, h } from '@stencil/core';

@Component({
  tag: 'stedux-counter',
  styleUrl: 'stedux-counter.css',
  shadow: true,
})
export class StenduxCounter {
  render() {
    return (
      <div>
        <ui-btn onClick={() => console.log('le clikc')}>-</ui-btn>
        <ui-jumbo>0</ui-jumbo>
        <ui-btn>+</ui-btn>
      </div>
    );
  }
}
