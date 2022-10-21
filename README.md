# Stedux

Stedux is a state management library for [Stencil](https://stenciljs.com/) components, inspired by [React Redux](https://react-redux.js.org/). Components can listen to state, dispatch actions or async actions easily.

## Instalation

`npm i stedux` or `yarn add stedux`

## Examples

Source code for examples can be found in the [example](./example/) folder.
The deployed live version can be found at https://randy-r.github.io/stedux.

- [Counter](#counter)
- [Data fetching / async thunks](#data-fetching--async-thunks)

### Counter

```tsx
// File: example/src/components/stedux-couter/stedux-counter.tsx
import { Component, h } from '@stencil/core';
import { Dispatch } from 'stedux';
import {
  createDispatch,
  createSelector,
  MyAction,
} from '../../store/counter-store';

@Component({
  tag: 'stedux-counter',
  shadow: true,
})
export class SteduxCounter {
  dispatch: Dispatch<MyAction>;
  counter: () => number;

  constructor() {
    this.dispatch = createDispatch(this);
    this.counter = createSelector((s) => s.counter, this);
  }

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
import { createStore } from 'stedux';

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

export const myInitialState: MyState = {
  counter: 0,
};

const { createDispatch, createSelector } = createStore<MyState, MyAction>(
  myInitialState,
  myRootReducer
);

export { createDispatch, createSelector };
```

### Data fetching / async thunks

```tsx
// File: example/src/components/stedux-async/stedux-async.tsx
import { Component, Host, h } from '@stencil/core';
import { Thunk, ThunkDispatch } from 'stedux';
import {
  createDispatch,
  createSelector,
  MyAction,
  MyState,
} from '../../store/person-store';

const fetchPerson =
  (id: number): Thunk<MyState, MyAction> =>
  async (dispatch, _getState) => {
    dispatch({ type: 'person-loading' });
    const response = await fetch(`https://swapi.dev/api/people/${id}`);
    if (!response.ok) {
      dispatch({
        type: 'person-error',
        payload: { error: { message: `${response.status}` } },
      });
      return;
    }
    const person = await response.json();
    dispatch({ type: 'person-done', payload: person });
  };

@Component({
  tag: 'stedux-async',
  shadow: true,
})
export class SteduxAsync {
  dispatch: ThunkDispatch<MyAction, MyState>;
  personData: () => MyState['person'];

  constructor() {
    this.personData = createSelector((s) => s.person, this);
    this.dispatch = createDispatch(this);
  }

  render() {
    const { data, loading, error } = this.personData();

    return (
      <Host>
        {loading && <div>Loading...</div>}
        {data && (
          <Fragment>
            <div>name: {data.name}</div>
            <div>height: {data.height}</div>
          </Fragment>
        )}
        {error && <div>Oops: {error.message}</div>}
        <button onClick={() => this.dispatch(fetchPerson(1))}>
          Fetch data
        </button>
      </Host>
    );
  }
}
```

```ts
// File: /src/store/async-store.ts
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

export type PersonAction =
  | PersonFetchLoading
  | PersonFetchDone
  | PersonFetchError;

export type MyAction = PersonAction;

export const myInitialState: MyState = {
  person: {
    loading: null,
    data: null,
    error: null,
  },
};

const personReducer = (
  slice: MyState['person'],
  action: MyAction
): MyState['person'] => {
  switch (action.type) {
    case 'person-loading':
      return { data: null, error: null, loading: true };
    case 'person-error':
      return { data: null, error: action.payload.error, loading: false };
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

const { createDispatch, createSelector } = createStore<MyState, MyAction>(
  myInitialState,
  myRootReducer
);

export { createDispatch, createSelector };
```
