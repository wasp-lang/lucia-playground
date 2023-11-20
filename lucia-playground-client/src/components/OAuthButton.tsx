import { Button } from "flowbite-react";

export function OAuthButton({ providerName }: { providerName: string }) {
  const providerNameCapitalized =
    providerName.charAt(0).toUpperCase() + providerName.slice(1);
  const url = `${import.meta.env.VITE_API_URL}/auth/login/${providerName}`;
  return (
    <Button fullSized={true} color="gray" href={url}>
      Login with {providerNameCapitalized}
    </Button>
  );
}
