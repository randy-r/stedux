import { forceUpdate, getElement, getRenderingRef } from '@stencil/core';
import { createStoreBase } from './stedux';
import { BaseAction, Reducer } from './stedux-types';
export * from './stedux-types';

function createStore<S, A extends BaseAction<any>>(
  initialState: S,
  rootReducer: Reducer<S, A>
) {
  const { createDispatch, createSelector, getState } = createStoreBase(
    initialState,
    rootReducer,
    {
      forceUpdate,
      getElement,
      getRenderingRef,
    }
  );

  return { createDispatch, createSelector, getState };
}

export { createStore };
