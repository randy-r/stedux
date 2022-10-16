export type Reducer<S, A> = {
  (state: S, action: A): S;
};

export type GetRenderingRef = () => any;
export type GetElement = (comp: any) => any;
export type ForceUpdate = (ref: any) => void;

export type StashConfig = {
  getRenderingRef: GetRenderingRef;
  getElement: GetElement;
  forceUpdate: ForceUpdate;
};

export type Listener2<S, Vars, Return> = (stash: S, vars?: Vars) => Return;

export type StashField<V, R> = (vars?: V) => R;

export type SEV<S, Vars, Return> = {
  sel2: Listener2<S, Vars, Return>;
  caller2: any | null;
  vars2: Vars | null;
};

export interface HTMLStencilElement extends HTMLElement {
  componentOnReady(): Promise<this>;
}

export type BaseAction<Payload> = { type: string; payload?: Payload };

export type StashAction<P = undefined> = (args?: {
  payload: P;
}) => CustomEvent<{ type: string; payload?: P }>;

export type OnCleanup = {
  (): void;
};

export type ThunkContext = {
  setOnCleanup: (onCleanup: OnCleanup) => void;
};

export type Thunk<S, A extends { type: string }, R = any | undefined> = {
  (dispatch: Dispatch<A>, getAction: () => S, context: ThunkContext):
    | Promise<R>
    | R;
};

export type Dispatch<Action extends { type: string }> = (args: Action) => void;
export type ThunkDispatch<Action extends { type: string }, S = any> = (
  args:
    | Action
    | ((...args: any) => Thunk<S, Action, any> | Promise<Thunk<S, Action, any>>)
) => any | void | Promise<any | void>;
