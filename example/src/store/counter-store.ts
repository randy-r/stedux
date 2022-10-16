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
