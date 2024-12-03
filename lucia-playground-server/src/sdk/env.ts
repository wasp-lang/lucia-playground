import * as z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  GITHUB_CLIENT_ID: z.string({
    required_error: "GITHUB_CLIENT_ID is required",
  }),
  GITHUB_CLIENT_SECRET: z.string({
    required_error: "GITHUB_CLIENT_SECRET is required",
  }),
  GOOGLE_CLIENT_ID: z.string({
    required_error: "GOOGLE_CLIENT_ID is required",
  }),
  GOOGLE_CLIENT_SECRET: z.string({
    required_error: "GOOGLE_CLIENT_SECRET is required",
  }),
  DISCORD_CLIENT_ID: z.string({
    required_error: "DISCORD_CLIENT_ID is required",
  }),
  DISCORD_CLIENT_SECRET: z.string({
    required_error: "DISCORD_CLIENT_SECRET is required",
  }),
  KEYCLOAK_CLIENT_ID: z.string({
    required_error: "KEYCLOAK_CLIENT_ID is required",
  }),
  KEYCLOAK_CLIENT_SECRET: z.string({
    required_error: "KEYCLOAK_CLIENT_SECRET is required",
  }),
  KEYCLOAK_REALM_URL: z.string({
    required_error: "KEYCLOAK_REALM_URL is required",
  }),
  SERVER_URL: z.string({
    required_error: "SERVER_URL is required",
  }),
  CLIENT_URL: z.string({
    required_error: "CLIENT_URL is required",
  }),
  JWT_SECRET: z.string({
    required_error: "JWT_SECRET is required",
  }),
});

function tryToParseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (e) {
    if (e instanceof z.ZodError) {
      e.errors.forEach((error) => {
        console.error(error.message);
      });
    } else {
      console.error(e);
    }

    process.exit(1);
  }
}

export const env = tryToParseEnv();
