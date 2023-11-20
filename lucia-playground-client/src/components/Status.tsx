import { Alert } from "flowbite-react";
import { useState } from "react";
import { HiInformationCircle } from "react-icons/hi";

export function Status({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  return (
    <>
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" icon={HiInformationCircle}>
          {success}
        </Alert>
      )}
    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStatus() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const clear = () => {
    setError(null);
    setSuccess(null);
  };
  return {
    error,
    setError,
    success,
    setSuccess,
    clear,
  };
}
