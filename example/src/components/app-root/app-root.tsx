import { Component, h } from '@stencil/core';
import { createRouter, Route, href } from 'stencil-router-v2';

const Router = createRouter();

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
            Ste<span class="highlight">dux</span>
          </h1>
          <span class="app-links desktop">
            <a {...href('/counter', Router)} class={{ active: activePath === '/counter' }}>
              Counter
            </a>
            <a {...href('/async', Router)} class={{ active: activePath === '/async' }}>
              Async
            </a>
          </span>
          <span class="external-links">
            <a href="https://github.com/randy-r/stedux" target="_blank">
              github
            </a>
            <a href="https://www.npmjs.com/package/stedux" target="_blank">
              npm
            </a>
          </span>
        </nav>

        <main>
          <Router.Switch>
            <Route path="/" to="/counter" />
            <Route path="/counter">
              <stedux-counter />
            </Route>
            <Route path="/async">
              <stedux-async />
            </Route>
          </Router.Switch>
        </main>
      </div>
    );
  }
}
