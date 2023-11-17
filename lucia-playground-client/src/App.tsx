import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, Button, Label, TextInput, Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

import { useAuth } from "./auth";
import { AxiosError } from "axios";

function App() {
  const auth = useAuth();
  const { data: user } = auth.useGetUser();
  const logout = auth.useLogout();
  return (
    <>
      <div className="mx-auto py-8 max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-5xl font-extrabold mb-4">Lucia Playground</h1>
          <p className="text-lg">
            Welcome to the Lucia Playground! This is a place to experiment with
            Lucia, an auth library for JS.
          </p>
        </header>
        {!user && (
          <div className="space-y-4 p-8 bg-gray-100 rounded-md">
            <h2 className="text-2xl font-bold">Auth</h2>
            <Button
              fullSized={true}
              color="gray"
              href="http://localhost:3001/auth/login/github"
            >
              Login with Github
            </Button>
            <Button
              fullSized={true}
              color="gray"
              href="http://localhost:3001/auth/login/google"
            >
              Login with Google
            </Button>
            <Button
              fullSized={true}
              color="gray"
              href="http://localhost:3001/auth/login/discord"
            >
              Login with Discord
            </Button>
            <Tabs.Group aria-label="Tabs with underline" style="underline">
              <Tabs.Item active title="Login">
                <LoginForm />
              </Tabs.Item>
              <Tabs.Item title="Signup">
                <SignupForm />
              </Tabs.Item>
            </Tabs.Group>
          </div>
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
      </div>
    </>
  );
}

function SignupForm() {
  const auth = useAuth();
  const signUp = auth.useSignUp();
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const result = await signUp.mutateAsync(data);
      console.log(result.data);
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as {
          message: string;
        };
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}
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

function LoginForm() {
  const auth = useAuth();
  const login = auth.useLogin();
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const result = await login.mutateAsync({
        email: data.email,
        password: data.password,
      });
      console.log(result.data);
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as {
          message: string;
        };
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}
        </Alert>
      )}
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

export default App;
