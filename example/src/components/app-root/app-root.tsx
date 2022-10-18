import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  render() {
    return (
      <div class="root">
        <nav>
          <h1>
            Ste<span class="highlight">dux</span>
          </h1>
          <span class="app-links desktop">
            <stencil-route-link activeClass="active" url="/counter">
              Counter
            </stencil-route-link>
            <stencil-route-link activeClass="active" url="/async">
              Async
            </stencil-route-link>
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
          <stencil-router class="flex">
            <stencil-route-switch class="flex" scrollTopOffset={0}>
              <stencil-route class="flex" url="/" component="stedux-counter" exact={true} />
              <stencil-route class="flex" url="/counter" component="stedux-counter" exact={true} />
              <stencil-route class="flex" url="/async" component="stedux-async" exact={true} />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}
