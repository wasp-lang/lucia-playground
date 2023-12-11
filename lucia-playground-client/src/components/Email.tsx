import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Button, Label, TextInput } from "flowbite-react";

import { useAuth } from "../auth";
import { Status, useStatus } from "./Status";
import { getFirstZodValidationError, isZodValidationError } from "../utils.js";
import { useState } from "react";

export function SignupForm() {
  const auth = useAuth();
  const signUp = auth.email.useSignUp();
  const { error, setError, success, setSuccess, clear } = useStatus();
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<{
    email: string;
    password: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      const response = await signUp.mutateAsync(data);
      setSuccess(response.data.message);
    } catch (e: unknown) {
      if (!(e instanceof AxiosError && e.response)) {
        setError("Something went wrong.");
        return;
      }
      if (isZodValidationError(e.response.data)) {
        setError(getFirstZodValidationError(e.response.data));
      } else {
        const error = e.response.data;
        setError(error.message);
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Status error={error} success={success} />
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="email">Email</Label>
        </div>
        <TextInput
          type="email"
          id="email"
          color={errors && errors.email && "failure"}
          helperText={errors && errors.email && "Email is required"}
          {...register("email", {
            required: true,
          })}
        />
      </div>
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="password">Password</Label>
        </div>
        <TextInput
          type="password"
          id="password"
          color={errors && errors.password && "failure"}
          helperText={errors && errors.password && "Password is required"}
          {...register("password", {
            required: true,
          })}
        />
      </div>
      <Button type="submit">Signup</Button>
    </form>
  );
}

export function LoginForm() {
  const auth = useAuth();
  const login = auth.email.useLogin();
  const { error, setError, success, setSuccess, clear } = useStatus();

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<{
    email: string;
    password: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      const response = await login.mutateAsync({
        email: data.email,
        password: data.password,
      });
      setSuccess(response.data.message);
    } catch (e: unknown) {
      if (!(e instanceof AxiosError && e.response)) {
        setError("Something went wrong.");
        return;
      }
      if (isZodValidationError(e.response.data)) {
        setError(getFirstZodValidationError(e.response.data));
      } else {
        const error = e.response.data;
        setError(error.message);
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Status error={error} success={success} />
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="email">Email</Label>
        </div>
        <TextInput
          type="email"
          id="email"
          color={errors && errors.email && "failure"}
          helperText={errors && errors.email && "Email is required"}
          {...register("email", {
            required: true,
          })}
        />
      </div>
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="password">Password</Label>
        </div>
        <TextInput
          type="password"
          id="password"
          color={errors && errors.password && "failure"}
          helperText={errors && errors.password && "Password is required"}
          {...register("password", {
            required: true,
          })}
        />
      </div>
      <Button type="submit">Login</Button>
    </form>
  );
}

export function RequestPasswordReset() {
  const auth = useAuth();
  const requestPasswordReset = auth.email.useRequestPasswordReset();
  const { error, setError, success, setSuccess, clear } = useStatus();

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<{
    email: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      const response = await requestPasswordReset.mutateAsync({
        email: data.email,
      });
      setSuccess(response.data.message);
    } catch (e: unknown) {
      if (!(e instanceof AxiosError && e.response)) {
        setError("Something went wrong.");
        return;
      }
      if (isZodValidationError(e.response.data)) {
        setError(getFirstZodValidationError(e.response.data));
      } else {
        const error = e.response.data;
        setError(error.message);
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Status error={error} success={success} />
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="email">Email</Label>
        </div>
        <TextInput
          type="email"
          id="email"
          color={errors && errors.email && "failure"}
          helperText={errors && errors.email && "Email is required"}
          {...register("email", {
            required: true,
          })}
        />
      </div>
      <Button type="submit">Request password reset</Button>
    </form>
  );
}

export function ResetPassword() {
  const auth = useAuth();
  const resetPassword = auth.email.usePasswordReset();
  const { error, setError, success, setSuccess, clear } = useStatus();
  const [passwordInputType, setPasswordInputType] = useState("password");
  const [token, setToken] = useState(
    new URLSearchParams(window.location.search).get("token")!
  );

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
  } = useForm<{
    newPassword: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      const response = await resetPassword.mutateAsync({
        token: token,
        password: data.newPassword,
      });
      setSuccess(response.data.message);
      // Remove token from URL
      setToken("");
      // Go to /
      window.history.pushState({}, "", "/");
      reset();
    } catch (e: unknown) {
      if (!(e instanceof AxiosError && e.response)) {
        setError("Something went wrong.");
        return;
      }
      if (isZodValidationError(e.response.data)) {
        setError(getFirstZodValidationError(e.response.data));
      } else {
        const error = e.response.data;
        setError(error.message);
      }
    }
  });

  function togglePasswordVisibility() {
    setPasswordInputType((prev) => (prev === "password" ? "text" : "password"));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Status error={error} success={success} />
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="password">Password</Label>
        </div>
        <div className="relative">
          <TextInput
            type={passwordInputType}
            id="password"
            color={errors && errors.newPassword && "failure"}
            helperText={errors && errors.newPassword && "Password is required"}
            {...register("newPassword", {
              required: true,
            })}
          />
          <button
            type="button"
            className="absolute right-0 top-0 mt-2 mr-2"
            onClick={togglePasswordVisibility}
          >
            {passwordInputType === "password" ? "Show" : "Hide"}
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="mb-2 block">
          <Label htmlFor="password">Token</Label>
        </div>
        <div className="text-sm text-gray-600 py-2 rounded-md break-words">
          {token || "No token found in URL"}
        </div>
      </div>

      <Button type="submit">Set new password</Button>
    </form>
  );
}
