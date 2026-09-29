import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from './react.js';

const RouterContext = createContext({
  location: { pathname: '/', search: '', hash: '' },
  navigate: () => {},
  params: {},
  outlet: null
});

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
    hash: window.location.hash || '',
    state: window.history.state || null
  }));

  useEffect(() => {
    const handlePopState = (e) => {
      setLocation({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
        hash: window.location.hash || '',
        state: e.state || null
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }

    let nextPath = typeof to === 'string' ? to : (to.pathname + (to.search || '') + (to.hash || ''));
    if (!nextPath.startsWith('/')) {
      const currentDir = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
      nextPath = currentDir + '/' + nextPath;
    }

    if (options.replace) {
      window.history.replaceState(options.state || null, '', nextPath);
    } else {
      window.history.pushState(options.state || null, '', nextPath);
    }

    setLocation({
      pathname: window.location.pathname || '/',
      search: window.location.search || '',
      hash: window.location.hash || '',
      state: options.state || null
    });
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const value = useMemo(() => ({
    location,
    navigate,
    params: {},
    outlet: null
  }), [location, navigate]);

  return React.createElement(RouterContext.Provider, { value }, children);
}

export function HashRouter({ children }) {
  return React.createElement(BrowserRouter, null, children);
}

export function Route(props) {
  return null;
}

function matchRoute(routePath, currentPath, isParent) {
  if (routePath === '*') return { match: true, params: {} };
  
  // Clean paths
  const normRoute = routePath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  const normCurrent = currentPath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

  if (normRoute === '' && normCurrent === '') return { match: true, params: {} };

  const routeSegments = normRoute.split('/').filter(Boolean);
  const currentSegments = normCurrent.split('/').filter(Boolean);

  if (isParent) {
    if (currentSegments.length < routeSegments.length) return { match: false, params: {} };
  } else {
    if (currentSegments.length !== routeSegments.length) return { match: false, params: {} };
  }

  const params = {};
  for (let i = 0; i < routeSegments.length; i++) {
    const r = routeSegments[i];
    const c = currentSegments[i];
    if (r.startsWith(':')) {
      params[r.slice(1)] = decodeURIComponent(c);
    } else if (r !== c) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export function Routes({ children }) {
  const { location, navigate } = useContext(RouterContext);
  const currentPath = location.pathname || '/';

  const childArray = React.Children.toArray(children);

  let matchedElement = null;
  let matchedParams = {};

  for (const child of childArray) {
    if (!React.isValidElement(child)) continue;

    const { path, element, index, children: nestedRoutes } = child.props;

    // Check if this route has nested children (e.g. /player -> <PlayerLayout /> with child <Route index />, <Route path="play" />)
    if (nestedRoutes) {
      const parentPath = path || '';
      const parentMatch = matchRoute(parentPath, currentPath, true);

      if (parentMatch.match) {
        // Now find matching nested child route
        const nestedArray = React.Children.toArray(nestedRoutes);
        let childOutlet = null;
        let childParams = { ...parentMatch.params };

        // Calculate relative sub-path after parent
        const cleanParent = parentPath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        const parentSegments = cleanParent.split('/').filter(Boolean);
        const allSegments = currentPath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '').split('/').filter(Boolean);
        const subPathSegments = allSegments.slice(parentSegments.length);
        const subPath = subPathSegments.join('/');

        for (const nChild of nestedArray) {
          if (!React.isValidElement(nChild)) continue;
          const { path: nPath, index: isIndex, element: nElement } = nChild.props;

          if (isIndex && subPath === '') {
            childOutlet = nElement;
            break;
          } else if (nPath) {
            const subMatch = matchRoute(nPath, subPath, false);
            if (subMatch.match) {
              childOutlet = nElement;
              childParams = { ...childParams, ...subMatch.params };
              break;
            }
          }
        }

        if (childOutlet !== null) {
          matchedParams = childParams;
          // Wrap parent element with childOutlet in RouterContext
          matchedElement = React.createElement(
            RouterContext.Provider,
            {
              value: {
                location,
                navigate,
                params: matchedParams,
                outlet: childOutlet
              }
            },
            element
          );
          break;
        }
      }
    } else {
      // Top-level direct route
      if (index && currentPath === '/') {
        matchedElement = element;
        break;
      }
      if (path) {
        const directMatch = matchRoute(path, currentPath, false);
        if (directMatch.match) {
          matchedParams = directMatch.params;
          matchedElement = element;
          break;
        }
      }
    }
  }

  return matchedElement;
}

export function Outlet() {
  const { outlet } = useContext(RouterContext);
  return outlet || null;
}

export function Link({ to, replace, className, children, onClick, ...rest }) {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.altKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to, { replace });
    }
  };

  return React.createElement(
    'a',
    {
      href: to,
      className,
      onClick: handleClick,
      ...rest
    },
    children
  );
}

export function NavLink({ to, className, children, end, ...rest }) {
  const { location } = useContext(RouterContext);
  const currentPath = location.pathname || '/';

  const isActive = end
    ? currentPath === to
    : currentPath === to || (to !== '/' && currentPath.startsWith(to));

  const resolvedClass = typeof className === 'function'
    ? className({ isActive, isPending: false })
    : className;

  return React.createElement(
    Link,
    {
      to,
      className: resolvedClass,
      ...rest
    },
    typeof children === 'function' ? children({ isActive, isPending: false }) : children
  );
}

export function Navigate({ to, replace = true, state }) {
  const { navigate } = useContext(RouterContext);

  useEffect(() => {
    navigate(to, { replace, state });
  }, [navigate, to, replace, state]);

  return null;
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useLocation() {
  const { location } = useContext(RouterContext);
  return location;
}

export function useParams() {
  const { params } = useContext(RouterContext);
  return params;
}

export function useSearchParams() {
  const { location, navigate } = useContext(RouterContext);

  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search || '');
  }, [location.search]);

  const setSearchParams = useCallback((nextInit, options = {}) => {
    const nextSearch = typeof nextInit === 'function'
      ? nextInit(new URLSearchParams(location.search || ''))
      : nextInit;

    const searchStr = nextSearch ? ('?' + nextSearch.toString()) : '';
    navigate(location.pathname + searchStr + (location.hash || ''), options);
  }, [location.pathname, location.search, location.hash, navigate]);

  return [searchParams, setSearchParams];
}

export default {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Outlet,
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams
};
