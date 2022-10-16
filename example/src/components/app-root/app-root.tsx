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
        <header>
          <h1>Stedux</h1>
        </header>

        <main>
          <stencil-router class="flex">
            <stencil-route-switch class="flex" scrollTopOffset={0}>
              <stencil-route class="flex" url="/" component="stedux-counter" exact={true} />
              <stencil-route class="flex" url="/counter" component="stedux-counter" exact={true} />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}
