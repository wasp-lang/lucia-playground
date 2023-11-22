import {
  Router,
  Route,
  RootRoute,
  lazyRouteComponent,
} from "@tanstack/react-router";

import { Root } from "./Root";

const rootRoute = new RootRoute({
  component: Root,
});

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("../App")),
});

export const userRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/user",
  component: lazyRouteComponent(() => import("../User")),
});

export const callbackRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/callback/$provider",
  component: lazyRouteComponent(() => import("../Callback")),
});

export const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "$",
  component: () => <div>Not Found</div>,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  userRoute,
  callbackRoute,
  notFoundRoute,
]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
