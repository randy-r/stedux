# Stedux

Stedux is a state management library for [Stencil](https://stenciljs.com/) components, inspired by [React Redux](https://react-redux.js.org/). Components can listen to state, dispatch action or async actions easily.

## Instalation

`npm i stedux` or `yarn add stedux`

## Examples

### Counter

```tsx
// File: example/src/components/stedux-couter/stedux-counter.tsx

import { Component, h } from '@stencil/core';
import { Dispatch } from 'stedux';
// 1. Import functions from the path where you built the store.
import {
  createDispatch,
  createSelector,
  MyAction,
} from '../../store/counter-store';

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
    this.counter = createSelector((s) => s.counter, this);
  }

  // 3. Use `dispatch` on handlers and selector values for rendering.
  render() {
    return (
      <div>
        <button onClick={() => this.dispatch({ type: 'decrement' })}>-</button>
        <span>{this.counter()}</span>
        <button onClick={() => this.dispatch({ type: 'increment' })}>+</button>
      </div>
    );
  }
}
```

```tsx
// File: /src/store/counter-store.ts

import { forceUpdate, getElement, getRenderingRef } from '@stencil/core';
import { createStore } from 'stedux';

/** 1. Declare your state and action types. */

export type MyState = {
  counter: number;
};

export type Increment = {
  type: 'increment';
};
export type Decrement = {
  type: 'decrement';
};

export type MyAction = Increment | Decrement;

/** 3. Write reducer function(s) for each slice of your state and use them in a root reducer. */

const counterReducer = (slice: MyState['counter'], action: MyAction) => {
  switch (action.type) {
    case 'decrement':
      return slice - 1;
    case 'increment':
      return slice + 1;
    default:
      return slice;
  }
};

export const myRootReducer = (state: MyState, action: MyAction): MyState => {
  const counter = counterReducer(state.counter, action);
  return {
    ...state,
    counter,
  };
};

/** 4. Set initial values for your state. */

export const myInitialState: MyState = {
  counter: 0,
};

/** 5. Call `createStore` with the above and export the returned functions. */

const { createDispatch, createSelector } = createStore<MyState, MyAction>(myInitialState, myRootReducer, {
  forceUpdate,
  getElement,
  getRenderingRef,
});

export { createDispatch, createSelector };

```

See the full source code for the Stencil app with examples [here](./example/).