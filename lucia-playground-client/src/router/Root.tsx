import { Outlet, Link } from "@tanstack/react-router";
import { Navbar } from "flowbite-react";

export function Root() {
  return (
    <>
      <div className="mx-auto py-8 max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header>
          <Navbar fluid rounded>
            <Navbar.Brand as="span">
              <Link to="/">
                <span className="whitespace-nowrap text-xl font-semibold dark:text-white">
                  Lucia Playground
                </span>
              </Link>
            </Navbar.Brand>
            <Navbar.Collapse>
              <Link to="/">
                {({ isActive }) => (
                  <Navbar.Link active={isActive} as="span">
                    Home
                  </Navbar.Link>
                )}
              </Link>
              <Link to="/user">
                {({ isActive }) => (
                  <Navbar.Link active={isActive} as="span">
                    User
                  </Navbar.Link>
                )}
              </Link>
            </Navbar.Collapse>
          </Navbar>
        </header>

        <Outlet />
      </div>
    </>
  );
}
