import { useParams } from "@tanstack/react-router";
import { callbackRoute } from "./router";

function Callback() {
  const params = useParams({
    from: callbackRoute.id,
  });

  return <div>We'll do something with {params.provider}!</div>;
}

export default Callback;
