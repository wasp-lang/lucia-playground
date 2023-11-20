import { Tabs, Button } from "flowbite-react";

import { useAuth } from "./auth";
import { OAuthButton } from "./components/OAuthButton";
import * as Email from "./components/Email";
import * as Username from "./components/Username";

function App() {
  const auth = useAuth();
  const { data: user } = auth.useGetUser();
  const logout = auth.useLogout();
  return (
    <>
      <div className="mx-auto py-8 max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-5xl font-extrabold mb-4">Lucia Playground</h1>
          <p className="text-lg">
            Welcome to the Lucia Playground! This is a place to experiment with
            Lucia, an auth library for JS.
          </p>
        </header>
        {!user && (
          <div className="space-y-4 p-8 bg-gray-100 rounded-md">
            <h2 className="text-2xl font-bold">Auth</h2>
            <OAuthButton providerName="github" />
            <OAuthButton providerName="google" />
            <OAuthButton providerName="discord" />
            <Tabs.Group aria-label="Auth options" style="underline">
              <Tabs.Item active title="Login with Email">
                <Email.LoginForm />
              </Tabs.Item>
              <Tabs.Item title="Signup with Email">
                <Email.SignupForm />
              </Tabs.Item>
              <Tabs.Item active title="Login with Username">
                <Username.LoginForm />
              </Tabs.Item>
              <Tabs.Item title="Signup with Username">
                <Username.SignupForm />
              </Tabs.Item>
            </Tabs.Group>
          </div>
        )}
        {user && (
          <div className="space-y-4 p-8 bg-gray-100 rounded-md">
            <h2 className="text-2xl font-bold">User Info</h2>
            <pre>
              <code>{JSON.stringify(user, null, 2)}</code>
            </pre>
            <Button onClick={() => logout.mutate()}>Logout</Button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
