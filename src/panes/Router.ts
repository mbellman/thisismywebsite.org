type Routes = Record<string, () => void>

type RouteChangeHandler = (route: string) => void;

export default class Router {
  private static routeChangeHandlers: RouteChangeHandler[] = [];
  private routes: Routes;

  public static changeRoute(url: string): void {
    window.history.pushState(null, '', url);

    for (const handler of Router.routeChangeHandlers) {
      handler(url);
    }
  }

  public static onRouteChange(handler: RouteChangeHandler): void {
    Router.routeChangeHandlers.push(handler);
  }

  public constructor(routes: Routes) {
    this.routes = routes;

    this.handleRouting();
  }

  private handleRouting(): void {
    // Set up initial route page
    const setup = this.routes[window.location.pathname];

    setup?.();

    // Handle teardown/setup on route changes
    Router.onRouteChange(route => {
      // @todo
      console.log(route);
    });
  }
}