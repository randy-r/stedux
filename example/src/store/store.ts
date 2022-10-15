import { forceUpdate, getElement, getRenderingRef } from '@stencil/core';
import { createStore } from 'stedux';

export type MyState = {
  counter: number;
  counter2: number;
  person: {
    loading: boolean | null;
    data: { name: string; height: string } | null;
    error: { message?: string; name?: string } | null;
  };
};

export type Increment = {
  type: 'increment';
  payload: { step: number };
};
export type Decrement = {
  type: 'decrement';
};

export type PersonFetchLoading = {
  type: 'person-fetch-loading';
};
export type PersonFetchDone = {
  type: 'person-fetch-done';
  payload: { name: string; height: string };
};
export type PersonFetchError = {
  type: 'person-fetch-error';
  payload: { error: { message?: string; name?: string } };
};

export type PersonAction = PersonFetchLoading | PersonFetchDone | PersonFetchError;

export type MyAction = Increment | Decrement | PersonAction;

export const INITIAL: MyState = {
  counter: 10,
  counter2: 100,
  person: {
    loading: null,
    data: null,
    error: null,
  },
};

const counterReducer = (slice: MyState['counter'], action: MyAction) => {
  switch (action.type) {
    case 'decrement':
      return slice - 1;
    case 'increment':
      return slice + action.payload.step;

    default:
      return slice;
  }
};

const counterReducer2 = (slice: MyState['counter2'], action: MyAction) => {
  switch (action.type) {
    case 'decrement':
      return slice - 1;
    case 'increment':
      return slice + action.payload.step;
    default:
      return slice;
  }
};

const personReducer = (slice: MyState['person'], action: MyAction): MyState['person'] => {
  switch (action.type) {
    case 'person-fetch-loading':
      return { data: null, error: null, loading: true };
    case 'person-fetch-error': {
      if (action.payload.error.message === 'The user aborted a request.') {
        return INITIAL.person;
      }
      return { data: null, error: action.payload.error, loading: false };
    }
    case 'person-fetch-done':
      return { data: action.payload, error: null, loading: false };
    default:
      return slice;
  }
};

export const myRootReducer = (state: MyState, action: MyAction): MyState => {
  const counter = counterReducer(state.counter, action);
  const counter2 = counterReducer2(state.counter2, action);
  return {
    ...state,
    counter,
    counter2,
    person: personReducer(state.person, action),
  };
};

const { createDispatch, createSelector, createProvider } = createStore<MyState, MyAction>(INITIAL, myRootReducer, {
  forceUpdate,
  getElement,
  getRenderingRef,
});
export { createDispatch, createSelector, createProvider };
