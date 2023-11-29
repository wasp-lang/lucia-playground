import { Tabs } from "flowbite-react";

import { OAuthButton } from "./components/OAuthButton";
import * as Email from "./components/Email";
import * as Username from "./components/Username";
import { Navigate } from "@tanstack/react-router";
import { userRoute } from "./router";
import { useAuth } from "./auth";

function App() {
  const auth = useAuth();
  const { data: user } = auth.useGetUser();

  if (user) {
    return <Navigate to={userRoute.id} hash={() => ""} />;
  }

  return (
    <>
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
          <Tabs.Item title="Request password reset">
            <Email.RequestPasswordReset />
          </Tabs.Item>
          <Tabs.Item title="Reset password">
            <Email.ResetPassword />
          </Tabs.Item>
          <Tabs.Item active title="Login with Username">
            <Username.LoginForm />
          </Tabs.Item>
          <Tabs.Item title="Signup with Username">
            <Username.SignupForm />
          </Tabs.Item>
        </Tabs.Group>
      </div>
    </>
  );
}

export default App;
