import {
  ActionEvent,
  BaseAction,
  Dispatch,
  Listener2,
  OnCleanup,
  Reducer,
  SEV,
  StashConfig,
  StashElement,
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
  signalToRender() {
    const values = this.values();
    if (this.method === 'plain') {
      this.signalToRenderPlain(values);
    } else {
      this.signalToRenderAsync(values);
    }
    this.clear();
  }
  private signalToRenderPlain(values) {
    for (const qi of values) {
      this.forceUpdate(qi);
    }
  }
  private signalToRenderAsync(values) {
    const vs = [...values];
    new Promise(() => {
      this.signalToRenderPlain(vs);
    });
  }
}

const wholestashidGenerator = generateId();

function createStore<S, A extends BaseAction<any>>(
  initialState: S,
  rootReducer: Reducer<S, A>,
  config: StashConfig
) {
  const { forceUpdate, getElement, getRenderingRef } = config;

  const wholestashid = wholestashidGenerator.next().value;
  const actionEventType = `stash-action-${wholestashid}`;

  let subs: SEV<S, any, any>[] = [];
  let stash = { ...initialState };
  const reducer = rootReducer;

  const getState = () => stash;

  const renderQ = new RenderQ('set', 'async', forceUpdate);

  const handleActionEvent = (evt: ActionEvent<A>) => {
    const crtStash = stash;
    const newStash = reducer(crtStash, evt.detail);
    subs = subs.filter((sub) => sub.caller2.isConnected);
    for (const sc of subs) {
      const newSelection = sc.sel2(newStash, sc.vars2);
      const oldSelection = sc.sel2(crtStash, sc.vars2);
      if (newSelection !== oldSelection) {
        renderQ.add(sc.caller2);
      }
    }
    stash = newStash;
    // @ts-ignore
    window.stash = stash;
    renderQ.signalToRender();
  };

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
    // @ts-ignore
    window.stash = stash;
    renderQ.signalToRender();
  };

  const eventListener = (evt: ActionEvent<A>) => {
    try {
      evt.stopPropagation();
      evt.preventDefault();
      handleActionEvent(evt);
    } catch (err) {
      const newErr = new Error('Stash event listener: ' + err?.message);
      if (err.stack) {
        newErr.stack = err.stack;
      }
      throw newErr;
    }
  };

  function atachStashActionEvent<S, A, Vars, Return>(
    _onEvent: (evt: ActionEvent<A>) => void,
    el: StashElement<S, A, Vars, Return>
  ) {
    const options: AddEventListenerOptions = {
      capture: true,
    };

    // This will be added any time the this file is modified during development in watch files mode
    // @ts-ignore
    el.addEventListener(actionEventType, eventListener, options);

    return () => {
      // @ts-ignore
      el.removeEventListener(actionEventType, eventListener, options);
    };
  }

  function createProvider(component: any) {
    // @ts-ignore
    const stash = rootReducer(initialState, { type: '__STASH_INIT__' });
    const element = getElement(component) as unknown as StashElement<
      S,
      A,
      any,
      any
    >;

    const detach = atachStashActionEvent(() => {}, element);
    overrideMethod(
      component,
      'disconnectedCallback',
      'createProvider',
      (original) => {
        return function (...args) {
          detach();
          original?.(...args);
        };
      }
    );
  }

  function createDispatch(component: any): ThunkDispatch<A, S> {
    // const el = getElement(component);
    if (!component['onCleanups']) {
      const onCleaups: OnCleanup[] = [];
      component['onCleanups'] = onCleaups;
    }

    const dispatch: Dispatch<A> = function dispatch(action: A) {
      const detail = { type: action.type, payload: action.payload };
      const ce = new CustomEvent(actionEventType, {
        detail,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      // el.dispatchEvent(ce);
      handleAction(action);
      return ce;
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
        (action as Thunk<S, A, any>)(dispatch, getState, context).then(
          (r: any) => {
            component['onCleanups'] = component['onCleanups'].filter(
              (oc: OnCleanup) => oc !== thunkOnCleanup
            );
            return r;
          }
        );
      } else if (
        Object.prototype.toString.call(action) === '[object Function]'
      ) {
        // it is a thunk
        (action as Thunk<S, A, any>)(dispatch, getState, context);
        component['onCleanups'] = component['onCleanups'].filter(
          (oc: OnCleanup) => oc !== thunkOnCleanup
        );
      } else {
        // @ts-ignore
        dispatch(action);
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
      // component['ownsubs'] = new Set<SEV<S, any, any>>();
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

  return { createDispatch, createSelector, createProvider };
}

export { createStore };
