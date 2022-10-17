// File: example/src/components/stedux-async/stedux-async.tsx
import { Component, Host, h } from '@stencil/core';
import { Thunk, ThunkDispatch } from 'stedux';
import { createDispatch, createSelector, MyAction, MyState } from '../../store/person-store';

const fetchPerson =
  (id: number): Thunk<MyState, MyAction> =>
  async (dispatch, _getState) => {
    try {
      dispatch({ type: 'person-loading' });
      const response = await fetch(`https://swapi.dev/api/people/${id}`);
      if (!response.ok) {
        dispatch({
          type: 'person-error',
          payload: { error: { message: `Failed to fetch: ${response.status}.` } },
        });
        return;
      }
      const person = await response.json();
      dispatch({ type: 'person-done', payload: person });
    } catch (e) {
      dispatch({
        type: 'person-error',
        payload: { error: { message: e.message } },
      });
    }
  };

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));

@Component({
  tag: 'stedux-async',
  styleUrl: 'stedux-async.css',
  shadow: true,
})
export class SteduxAsync {
  dispatch: ThunkDispatch<MyAction, MyState>;
  personData: () => MyState['person'];

  constructor() {
    this.personData = createSelector(s => s.person, this);
    this.dispatch = createDispatch(this);
  }

  render() {
    const { data, loading, error } = this.personData();
    const id = randInt(1, 11);

    const name = loading === null ? '-' : loading ? '...' : data.name;
    const height = loading === null ? '-' : loading ? '...' : data.height;

    return (
      <Host>
        <ui-btn onClick={() => this.dispatch(fetchPerson(id))}>Fetch data</ui-btn>
        <div class="data">
          <div class="row">
            <span class="label">name:</span>
            <span class="value">{name}</span>
          </div>
          <div class="row">
            <span class="label">height:</span>
            <span class="value">{height}</span>
          </div>
        </div>
        {error && <div>Oops: {error.message}</div>}
      </Host>
    );
  }
}
