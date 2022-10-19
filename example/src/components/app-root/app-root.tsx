import { Component, h } from '@stencil/core';
import { createRouter, Route, href } from 'stencil-router-v2';

const Router = createRouter();

const Npm = () => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="" width="50" height="50" viewBox="0 0 27.23 27.23">
    <rect class="fill-out" width="27.23" height="27.23" rx="2"></rect>
    <polygon class="fill-in" points="5.8 21.75 13.66 21.75 13.67 9.98 17.59 9.98 17.58 21.76 21.51 21.76 21.52 6.06 5.82 6.04 5.8 21.75"></polygon>
  </svg>
);

const Github = () => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="" viewBox="0 0 16 16" width="50" height="50">
    <path
      fill-rule="evenodd"
      class="fill-out"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
    ></path>
  </svg>
);

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  render() {
    const activePath = Router.activePath;
    return (
      <div class="root">
        <nav>
          <h1>
            <a {...href('/stedux', Router)}>
              Ste<span class="highlight">dux</span>
            </a>
          </h1>
          <span class="app-links desktop">
            <a {...href('/stedux/counter', Router)} class={{ active: activePath === '/stedux/counter' }}>
              Counter
            </a>
            <a {...href('/stedux/async', Router)} class={{ active: activePath === '/stedux/async' }}>
              Async
            </a>
          </span>
          <span class="external-links">
            <a href="https://github.com/randy-r/stedux" target="_blank">
              <Github />
            </a>
            <a href="https://www.npmjs.com/package/stedux" target="_blank">
              <Npm />
            </a>
          </span>
        </nav>

        <main>
          <Router.Switch>
            <Route path="/stedux" to="/stedux/counter" />
            <Route path="/stedux/" to="/stedux/counter" />
            <Route path="/stedux/counter/" to="/stedux/counter" />
            <Route path="/stedux/async/" to="/stedux/async" />
            <Route path="/stedux/counter">
              <stedux-counter />
            </Route>
            <Route path="/stedux/async">
              <stedux-async />
            </Route>
          </Router.Switch>
        </main>
        <div class="version">1.1.0</div>
      </div>
    );
  }
}
