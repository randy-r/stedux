import { createStoreBase } from './stedux';
import { Dispatch, Thunk, ThunkDispatch } from './stedux-types';

function delay(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

type MyState = {
  counter: number;
  person: {
    loading: boolean | null;
    data: { name: string; height: string } | null;
    error: { message?: string; name?: string } | null;
  };
};

type Increment = {
  type: 'increment';
};
type Decrement = {
  type: 'decrement';
};
type PersonFetchLoading = {
  type: 'person-loading';
};
type PersonFetchDone = {
  type: 'person-done';
  payload: { name: string; height: string };
};
type PersonFetchError = {
  type: 'person-error';
  payload: { error: { message?: string; name?: string } };
};

type PersonAction = PersonFetchLoading | PersonFetchDone | PersonFetchError;

type MyAction = Increment | Decrement | PersonAction;

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

const personReducer = (
  slice: MyState['person'],
  action: MyAction
): MyState['person'] => {
  switch (action.type) {
    case 'person-loading':
      return { data: null, error: null, loading: true };
    case 'person-error': {
      return { data: null, error: action.payload.error, loading: false };
    }
    case 'person-done':
      return { data: action.payload, error: null, loading: false };
    default:
      return slice;
  }
};

const reducer = (state: MyState, action: MyAction): MyState => {
  const counter = counterReducer(state.counter, action);
  const person = personReducer(state.person, action);

  return {
    ...state,
    counter,
    person,
  };
};

const state: MyState = {
  counter: 0,
  person: {
    loading: null,
    data: null,
    error: null,
  },
};

describe('dispatch', () => {
  it('action changes state', async () => {
    const { createDispatch, getState } = createStoreBase(state, reducer, {
      forceUpdate: (_ref: any) => {},
      getElement: (_comp: any) => ({}),
      getRenderingRef: () => ({}),
    });

    class Comp {
      dispatch: Dispatch<MyAction>;
      constructor() {
        this.dispatch = createDispatch(this);
      }
      render() {}
    }

    const comp = new Comp();
    comp.dispatch({ type: 'increment' });
    const newState = getState();

    expect(newState.counter).toBe(1);
  });
});

describe('selector', () => {
  it('picks slice from state', async () => {
    const { createSelector } = createStoreBase(state, reducer, {
      forceUpdate: (_ref: any) => {},
      getElement: (_comp: any) => ({}),
      getRenderingRef: () => ({}),
    });

    class Comp {
      counter: () => number;
      constructor() {
        this.counter = createSelector((s) => s.counter, this);
      }
      render() {
        return this.counter();
      }
    }

    const comp = new Comp();

    expect(comp.render()).toBe(0);
  });
});

const fetchPerson =
  (): Thunk<MyState, MyAction> => async (dispatch, _getState) => {
    dispatch({ type: 'person-loading' });
    await delay(1000);
    const person = { name: 'Joe Doe', height: '179' };
    dispatch({ type: 'person-done', payload: person });
  };

describe('thunks', () => {
  it('trigger rendering corectly', async () => {
    let comp: Comp | null = null;
    const { createSelector, createDispatch, getRenderPromise } =
      createStoreBase(state, reducer, {
        forceUpdate: (ref: any) => {
          ref.render();
        },
        getElement: (comp: any) => comp.__test__el,
        getRenderingRef: () => {
          return comp;
        },
      });

    class Comp {
      __test__personData: MyState['person'] | null = null;
      __test__el: any;

      person: () => MyState['person'];
      dispatch: ThunkDispatch<MyAction, MyState>;
      constructor() {
        this.__test__el = { isConnected: true, render: () => this.render() };
        this.dispatch = createDispatch(this);
        this.person = createSelector((s) => s.person, this);
      }
      render() {
        const personData = this.person();
        this.__test__personData = personData;
        return '';
      }
    }

    comp = new Comp();
    comp.render(); // initial render

    expect(comp.__test__personData).toEqual({
      data: null,
      loading: null,
      error: null,
    });

    // fire and forget the dispatch but wait for rendering
    comp.dispatch(fetchPerson()); 
    await getRenderPromise();

    expect(comp.__test__personData).toEqual({
      data: null,
      loading: true,
      error: null,
    });

    await getRenderPromise();

    expect(comp.__test__personData).toEqual({
      data: { name: 'Joe Doe', height: '179' },
      loading: false,
      error: null,
    });
  });
});
