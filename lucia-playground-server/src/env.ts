import * as z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CLIENT_URL: z.string({
    required_error: "CLIENT_URL is required",
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
