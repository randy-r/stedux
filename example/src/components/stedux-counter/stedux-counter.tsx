// File: /src/components/stedux-couter/stedux-counter.tsx

import { Component, h } from '@stencil/core';
import { Dispatch } from 'stedux';
// 1. Import functions from the path where you built the store.
import { createDispatch, createSelector, MyAction } from '../../store/counter-store';

@Component({
  tag: 'stedux-counter',
  styleUrl: 'stedux-counter.css',
  shadow: true,
})
export class SteduxCounter {
  dispatch: Dispatch<MyAction>;
  counter: () => number;

  constructor() {
    // 2. Create a dispatch for your actions and a selector for your state.
    //    Note: The value returned by `createDispatch` is function to be called
    //          for obtaining the current state value;
    this.dispatch = createDispatch(this);
    this.counter = createSelector(s => s.counter, this);
  }

  // 3. Use `dispatch` on handlers and selector values for rendering.
  render() {
    return (
      <div>
        <ui-btn onClick={() => this.dispatch({ type: 'decrement' })}>-</ui-btn>
        <ui-jumbo>{this.counter()}</ui-jumbo>
        <ui-btn onClick={() => this.dispatch({ type: 'increment' })}>+</ui-btn>
      </div>
    );
  }
}
