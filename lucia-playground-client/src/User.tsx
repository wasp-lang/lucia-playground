import { Button } from "flowbite-react";

import { useAuth } from "./auth";
import { indexRoute } from "./router";
import { Navigate } from "@tanstack/react-router";

function User() {
  const auth = useAuth();
  const { data: user } = auth.useGetUser();
  const logout = auth.useLogout();

  if (!user) {
    return <Navigate to={indexRoute.id} />;
  }

  return (
    <>
      {!user && (
        <div className="space-y-4 p-8 bg-gray-100 rounded-md">No user</div>
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
    </>
  );
}

export default User;
