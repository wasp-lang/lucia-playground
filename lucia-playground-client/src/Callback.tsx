import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { callbackRoute } from "./router";
import { useAuth } from "./auth";
import { Alert, Spinner } from "flowbite-react";
import { useEffect, useRef } from "react";

function Callback() {
  const params = useParams({
    from: callbackRoute.id,
  });
  const search = useSearch({
    from: callbackRoute.id,
  });
  const navigate = useNavigate();
  const auth = useAuth();

  const { mutate, isPending, isError } = auth.oauth.useLoginWithOAuth(
    params.provider,
    {
      code: search.code,
      state: search.state,
    }
  );

  const isSent = useRef(false);

  useEffect(() => {
    if (isSent.current) {
      navigate({
        to: "/user",
        replace: true,
      });
      return;
    }
    mutate();
    isSent.current = true;
  }, []);

  return (
    <div className="space-y-4 p-8 bg-gray-100 rounded-md">
      {isPending && <Spinner />}
      {isError && (
        <Alert color="failure">
          Unable to authenticated you with "{params.provider}"
        </Alert>
      )}
    </div>
  );
}

export default Callback;
