import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Button, Label, TextInput } from "flowbite-react";

import { useAuth } from "../auth";
import { Status, useStatus } from "./Status";
import { getFirstZodValidationError, isZodValidationError } from "../utils";

export function SignupForm() {
  const auth = useAuth();
  const signUp = auth.username.useSignUp();
  const { error, setError, success, setSuccess, clear } = useStatus();
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<{
    username: string;
    password: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      await signUp.mutateAsync(data);
      setSuccess("Successfully signed up!");
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
          <Label htmlFor="username">Username</Label>
        </div>
        <TextInput
          type="text"
          id="username"
          color={errors && errors.username && "failure"}
          helperText={errors && errors.username && "Username is required"}
          {...register("username", {
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
  const login = auth.username.useLogin();
  const { error, setError, success, setSuccess, clear } = useStatus();
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<{
    username: string;
    password: string;
  }>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      await login.mutateAsync(data);
      setSuccess("Successfully logged in!");
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
          <Label htmlFor="username">Username</Label>
        </div>
        <TextInput
          type="text"
          id="username"
          color={errors && errors.username && "failure"}
          helperText={errors && errors.username && "Username is required"}
          {...register("username", {
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
