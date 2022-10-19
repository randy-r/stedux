import {
  BaseAction,
  Dispatch,
  Listener2,
  OnCleanup,
  Reducer,
  SEV,
  StashConfig,
  StashField,
  Thunk,
  ThunkContext,
  ThunkDispatch,
} from './stedux-types';

function overrideMethod(
  target: any,
  methodName: string,
  from: 'createDispatch' | 'createSelector' | 'createProvider',
  newMethodBuilder: (original: any | null) => (...args: any[]) => any
) {
  const temp0 = `original__${methodName}__${from}__is_overriden`;
  if (target[temp0] === true) {
    return; // Do not override twice;
  }
  const temp = `original__${methodName}__${from}`;
  if (!target[temp] && typeof target[methodName] === 'function') {
    target[temp] = target[methodName].bind(target);
    target[temp].bind(target);
  }
  const alreadyAttached = target[temp];
  if (alreadyAttached) {
    const altered = newMethodBuilder(alreadyAttached);
    const bind = altered.bind(target);
    target[methodName] = bind;
  } else {
    const altered = newMethodBuilder(null);
    const bind = altered.bind(target);
    target[methodName] = bind;
  }

  target[temp0] = true;
}

function* generateId() {
  let base = 0;
  while (true) {
    base += 1;
    yield base;
  }
}

/**
 * Note: Stencil js has an async `forceUpdate` that batches the rendering.
 *       It is safe to use this class with 'list' and 'plain' in a Stencil context;
 */
class RenderQ {
  constructor(
    structure: 'list' | 'set',
    method: 'plain' | 'async',
    forceUpdate: StashConfig['forceUpdate']
  ) {
    this.structure = structure;
    this.method = method;
    this.forceUpdate = forceUpdate;
  }
  structure: 'list' | 'set';
  method: 'plain' | 'async';
  list: any[] = [];
  set = new Set();
  forceUpdate: StashConfig['forceUpdate'];

  add(component): void {
    if (this.structure === 'list') {
      this.list.push(component);
    } else {
      this.set.add(component);
    }
  }
  values() {
    if (this.structure === 'list') {
      return this.list;
    } else {
      return this.set.values();
    }
  }
  clear() {
    if (this.structure === 'list') {
      this.list = [];
    } else {
      this.set.clear();
    }
  }
  async signalToRender() {
    let p: Promise<any> | string = '__stedux_plain__';
    const values = this.values();
    if (this.method === 'plain') {
      this.signalToRenderPlain(values);
    } else {
      p = this.signalToRenderAsync(values);
    }
    this.clear();
    return p;
  }
  private signalToRenderPlain(values) {
    for (const qi of values) {
      this.forceUpdate(qi);
    }
  }
  private signalToRenderAsync(values) {
    const vs = [...values];
    return new Promise((resolve) => {
      this.signalToRenderPlain(vs);
      resolve('__stedux_async__');
    });
  }
}

function createStoreBase<S, A extends BaseAction<any>>(
  initialState: S,
  rootReducer: Reducer<S, A>,
  config: StashConfig
) {
  const { forceUpdate, getElement, getRenderingRef } = config;

  // @ts-ignore
  let stash = rootReducer(initialState, { type: '__STASH_INIT__' });
  let subs: SEV<S, any, any>[] = [];
  const reducer = rootReducer;

  const getState = () => stash;

  const renderQ = new RenderQ('set', 'async', forceUpdate);

  let rc = 0;
  let renderPromiseResolve: (value: string | PromiseLike<string>) => void;
  let renderPromise: Promise<string> | null = new Promise<string>((resolve) => {
    renderPromiseResolve = resolve;
  });

  const handleAction = (action: A) => {
    const crtStash = stash;
    const newStash = reducer(crtStash, action);
    subs = subs.filter((sub) => sub.caller2.isConnected);
    for (const sc of subs) {
      const newSelection = sc.sel2(newStash, sc.vars2);
      const oldSelection = sc.sel2(crtStash, sc.vars2);
      if (newSelection !== oldSelection) {
        renderQ.add(sc.caller2);
      }
    }
    stash = newStash;
    const newPromise = renderQ.signalToRender(); // fire and forget
    newPromise.then(() => {
      renderPromiseResolve(`__render_done_${++rc}__`);
      renderPromise = new Promise<string>((resolve) => {
        renderPromiseResolve = resolve;
      });
    });
  };

  function createDispatch(component: any): ThunkDispatch<A, S> {
    if (!component['onCleanups']) {
      const onCleaups: OnCleanup[] = [];
      component['onCleanups'] = onCleaups;
    }

    const dispatch: Dispatch<A> = function dispatch(action: A) {
      handleAction(action);
    };

    const thunkDispatch: ThunkDispatch<A, S> = function thunkDispatch(
      action: A | Thunk<S, A, any>
    ) {
      let thunkOnCleanup: OnCleanup | undefined = undefined;
      const context: ThunkContext = {
        setOnCleanup: (onCleaup) => {
          thunkOnCleanup = onCleaup;
          component['onCleanups'].push(onCleaup);
        },
      };
      if (action[Symbol.toStringTag] === 'AsyncFunction') {
        // it is an async thunk
        const thunkPromise = (action as Thunk<S, A, any>)(
          dispatch,
          getState,
          context
        ).then((r: any) => {
          component['onCleanups'] = component['onCleanups'].filter(
            (oc: OnCleanup) => oc !== thunkOnCleanup
          );
          return r;
        });
        return thunkPromise;
      } else if (
        Object.prototype.toString.call(action) === '[object Function]'
      ) {
        // it is a thunk
        const thunkResult = (action as Thunk<S, A, any>)(
          dispatch,
          getState,
          context
        );
        component['onCleanups'] = component['onCleanups'].filter(
          (oc: OnCleanup) => oc !== thunkOnCleanup
        );
        return thunkResult;
      } else {
        // @ts-ignore
        return dispatch(action);
      }
    };

    overrideMethod(
      component,
      'disconnectedCallback',
      'createDispatch',
      function (original) {
        return function () {
          for (const onCleanup of component['onCleanups'] as OnCleanup[]) {
            onCleanup?.();
          }
          original?.();
        };
      }
    );

    return thunkDispatch;
  } // createDispatch

  const componentIdGenerator = generateId();

  function createSelector<Return = any>(
    selector: Listener2<S, any, Return>,
    component: any
  ) {
    const el = getElement(component);
    const componentName = component.constructor.name;

    if (!component['ownsubs']) {
      component['ownsubs'] = new Set<string>();
    }

    if (!el['componentId']) {
      const id = componentIdGenerator.next().value;
      el['componentId'] = `${componentName}::${id}`;
    }

    if (!component['idGenerator']) {
      const idGenerator = generateId();
      component['idGenerator'] = idGenerator;
    }
    const idGenerator = component['idGenerator'];

    const selId = idGenerator.next().value;
    const componentId = el['componentId'];
    selector['stashId'] = `${componentId}::${selId}`;

    const select: StashField<any, Return> = function select(): Return {
      const rref = getRenderingRef();
      const existingSub = subs.find(
        (sb) => sb.sel2['stashId'] === selector['stashId']
      );
      // register only if it's called from render
      if (!existingSub && rref) {
        const sub = { sel2: selector, caller2: el, vars2: undefined };
        subs.push(sub);
        component['ownsubs'].add(selector['stashId']);
      }
      const v = selector(stash);
      return v;
    };

    overrideMethod(
      component,
      'disconnectedCallback',
      'createSelector',
      function (original) {
        return function () {
          // subs = subs.filter(sb => sb.sel2['stashId'] === selector['stashId'] && sb.);
          // remove all own subs from main subs
          subs = subs.filter(
            (sb) => !component['ownsubs'].has(sb.sel2['stashId'])
          );
          delete component['ownsubs'];
          original?.();
        };
      }
    );

    function selectorFunc(): Return {
      return select();
    }
    selectorFunc.bind(component);

    return selectorFunc;
  }

  const getRenderPromise = () => renderPromise;

  return { createDispatch, createSelector, getState, getRenderPromise };
}

export { createStoreBase };
