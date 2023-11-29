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
          {user.auth.authProviders.map(
            (
              provider:
                | {
                    providerId: "google";
                    providerData: {
                      name: string;
                      picture: string;
                    };
                  }
                | {
                    providerId: "github";
                    providerData: {
                      name: string;
                      avatar_url: string;
                    };
                  }
                | {
                    providerId: "discord";
                    providerData: {
                      username: string;
                      id: string;
                      avatar: string;
                    };
                  }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                | { providerId: "email"; providerData: any }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                | { providerId: "username"; providerData: any }
            ) => {
              if (provider.providerId === "github") {
                return (
                  <div key={provider.providerId}>
                    <h3 className="text-xl font-bold">Github</h3>
                    <p>{provider.providerData.name}</p>
                    <img
                      src={provider.providerData.avatar_url}
                      alt="avatar"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                );
              } else if (provider.providerId === "google") {
                return (
                  <div key={provider.providerId}>
                    <h3 className="text-xl font-bold">Google</h3>
                    <p>{provider.providerData.name}</p>
                    <img
                      src={provider.providerData.picture}
                      alt="avatar"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                );
              } else if (provider.providerId === "discord") {
                return (
                  <div key={provider.providerId}>
                    <h3 className="text-xl font-bold">Discord</h3>
                    <p>{provider.providerData.username}</p>
                    <img
                      src={`https://cdn.discordapp.com/avatars/${provider.providerData.id}/${provider.providerData.avatar}.png`}
                      alt="avatar"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={provider.providerId}>
                    <h3 className="text-xl font-bold">{provider.providerId}</h3>
                    <pre>{JSON.stringify(provider, null, 2)}</pre>
                  </div>
                );
              }
            }
          )}
          <Button onClick={() => logout.mutate()}>Logout</Button>
        </div>
      )}
    </>
  );
}

export default User;
