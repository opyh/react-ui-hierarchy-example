// @flow

type RouteFragment = string[];

interface HasRouteFragment {
  routeFragment(): RouteFragment;
};

interface HasChildren {
  children(): HasRouteFragment[];
};

interface HasChildRoute {
  childRoute(): RouteFragment;
};

interface CanNavigate {
  navigate(route: RouteFragment, options: { animated: boolean }): void;
};


export class Owned<T> {
  owner: T;

  constructor(owner: T) {
    this.owner = owner;
  }
}

export class Router<I> extends Owned<I & HasChildren & HasRouteFragment> {

}


interface HasRoot {
  rootChild(): HasChildRoute & CanNavigate,
}


export class StackRouter extends Router<HasRoot> {
  navigate(route: string[], options: { animated: boolean }): void {
    const newRoute = [].concat(route); // Clone route for safety reasons
    const rootChild: CanNavigate = this.owner.rootChild();
    rootChild.navigate(newRoute, options);
  }

  childRoute(): RouteFragment {
    const ownRouteFragment = this.owner.routeFragment();
    const childRouteFragments = this.owner.children().map(child => child.routeFragment());
    return Array.prototype.concat(ownRouteFragment, ...childRouteFragments);
  }
}


interface HasTabs {
  activeTab(): HasChildRoute & CanNavigate;
  setActiveTab(child: HasChildRoute & CanNavigate): void;
  tabForPrefix(prefix: string): HasChildRoute & CanNavigate;
}


export class TabRouter extends Router<HasTabs> {
  navigate(route: RouteFragment) {
    route = [].concat(route); // Clone route for safety reasons

    const prefix = route[0];
    const oldTab = this.owner.activeTab();
    const newTab = this.owner.tabForPrefix(prefix)

    if (!newTab) throw new Error(`Tab for prefix ${prefix} not found.`);

    this.owner.setActiveTab(newTab);

    // Caution: This might redirect and change the current route.
    return this.owner.activeTab().navigate(route, { animated: (oldTab !== newTab) });
  }

  childRoute(): string[] {
    const ownRouteFragment = this.owner.routeFragment();
    const activeTab = this.owner.activeTab();
    if (!activeTab) return ownRouteFragment;
    return ownRouteFragment.concat(activeTab.childRoute());
  }
}

export class IndexRouter {

}

export class ShowOrEditRouter extends TabRouter {

}