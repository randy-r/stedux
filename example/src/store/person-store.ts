// File: /src/store/async-store.ts
import { forceUpdate, getElement, getRenderingRef } from '@stencil/core';
import { createStore } from 'stedux';

export type MyState = {
  person: {
    loading: boolean | null;
    data: { name: string; height: string } | null;
    error: { message?: string; name?: string } | null;
  };
};

export type PersonFetchLoading = {
  type: 'person-loading';
};
export type PersonFetchDone = {
  type: 'person-done';
  payload: { name: string; height: string };
};
export type PersonFetchError = {
  type: 'person-error';
  payload: { error: { message?: string; name?: string } };
};

export type PersonAction = PersonFetchLoading | PersonFetchDone | PersonFetchError;

export type MyAction = PersonAction;

export const myInitialState: MyState = {
  person: {
    loading: null,
    data: null,
    error: null,
  },
};

const personReducer = (slice: MyState['person'], action: MyAction): MyState['person'] => {
  switch (action.type) {
    case 'person-loading':
      return { data: null, error: null, loading: true };
    case 'person-error': {
      if (action.payload.error.message === 'The user aborted a request.') {
        return myInitialState.person;
      }
      return { data: null, error: action.payload.error, loading: false };
    }
    case 'person-done':
      return { data: action.payload, error: null, loading: false };
    default:
      return slice;
  }
};

export const myRootReducer = (state: MyState, action: MyAction): MyState => {
  return {
    ...state,
    person: personReducer(state.person, action),
  };
};

const { createDispatch, createSelector, createProvider } = createStore<MyState, MyAction>(myInitialState, myRootReducer, {
  forceUpdate,
  getElement,
  getRenderingRef,
});

export { createDispatch, createSelector, createProvider };
