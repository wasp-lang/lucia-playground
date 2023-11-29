import { Navigate, useNavigate } from "@tanstack/react-router";
import { userRoute } from "./router";
import { useAuth } from "./auth";
import { Alert, Spinner } from "flowbite-react";
import { useEffect, useRef } from "react";

function Callback() {
  const auth = useAuth();
  const { data: user } = auth.useGetUser();

  const navigate = useNavigate();

  const code = window.location.hash.slice(1);
  const { mutate, isSuccess, isPending, isError } =
    auth.oauth.useExchangeCodeForToken({
      code,
    });

  const isSent = useRef(false);
  useEffect(() => {
    if (isSent.current) {
      return;
    }
    mutate();
    isSent.current = true;
  }, [isSuccess, mutate, navigate]);

  if (user) {
    return <Navigate to={userRoute.id} hash={() => ""} />;
  }

  return (
    <div className="space-y-4 p-8 bg-gray-100 rounded-md">
      {isPending && <Spinner />}
      {isError && (
        <Alert color="failure">
          Unable to authenticated you with the OAuth provider.
        </Alert>
      )}
    </div>
  );
}

export default Callback;
