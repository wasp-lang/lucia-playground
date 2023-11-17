import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import cors from "cors";
import * as z from "zod";
import { Prisma } from "@prisma/client";

import { env } from "./env.js";
import { auth, discordAuth, githubAuth, googleAuth } from "./lucia.js";

import { LuciaError } from "lucia";
import { parseCookie } from "lucia/utils";
import {
  OAuth2ProviderAuth,
  OAuthRequestError,
  ProviderUserAuth,
} from "@lucia-auth/oauth";
import {
  DiscordAuth,
  GithubAuth,
  GoogleAuth,
} from "@lucia-auth/oauth/providers";
import { prismaClient } from "./prisma.js";

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// Fingers crossed cookies still work
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const signupSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

// Group /auth routes
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  const parseResult = signupSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.issues[0].message,
    });
  }

  const { email, password } = parseResult.data;

  try {
    const user = await auth.createUser({
      key: {
        providerId: "email", // auth method
        providerUserId: email.toLowerCase(), // unique id when using "username" auth method
        password, // hashed by Lucia
      },
      attributes: {
        user: {
          create: {},
        },
      },
    });
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(req, res);
    authRequest.setSession(session);

    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    if (
      (e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002") ||
      (e instanceof LuciaError && e.message === "AUTH_DUPLICATE_KEY_ID")
    ) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    console.error(e);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

const loginSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string(),
});

authRouter.post("/login", async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.issues[0].message,
    });
  }

  const { email, password } = parseResult.data;

  try {
    const key = await auth.useKey("email", email.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(req, res);
    authRequest.setSession(session);

    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    if (
      e instanceof LuciaError &&
      (e.message === "AUTH_INVALID_KEY_ID" ||
        e.message === "AUTH_INVALID_PASSWORD")
    ) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

authRouter.get("/user", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const user = session.user;

  const businessLogicUser = await prismaClient.user.findFirst({
    where: {
      auth: {
        id: user.userId,
      },
    },
  });

  if (!businessLogicUser) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }

  return res.status(200).json({
    success: true,
    user,
    businessLogicUser,
  });
});

authRouter.post("/logout", async (req, res) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  await auth.invalidateSession(session.sessionId);

  authRequest.setSession(null); // for session cookie

  return res.status(200).json({
    success: true,
  });
});

function getCookieName(providerName: string) {
  return `${providerName}_oauth_state`;
}

function getLinkHandler(provider: OAuth2ProviderAuth, providerName: string) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    const [url, state] = await provider.getAuthorizationUrl();
    const cookieName = getCookieName(providerName);
    res.cookie(cookieName, state, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return res.status(302).setHeader("Location", url.toString()).end();
  };
}

function getCallbackHandler<
  Provider extends OAuth2ProviderAuth<ProviderUserAuth<any>>
>(
  provider: Provider,
  providerName: string,
  getUserData?: (
    providerData: Awaited<ReturnType<Provider["validateCallback"]>>
  ) => Record<string, unknown>
) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    const cookies = parseCookie(req.headers.cookie ?? "");
    const cookieName = getCookieName(providerName);
    const storedState = cookies[cookieName];
    const state = req.query.state;
    const code = req.query.code;

    if (
      !storedState ||
      !state ||
      storedState !== state ||
      typeof code !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid state",
      });
    }
    try {
      const providerData = await provider.validateCallback(code);

      const { getExistingUser, createUser } = providerData;

      const getUser = async () => {
        const existingUser = await getExistingUser();
        if (existingUser) {
          return existingUser;
        }
        const user = await createUser({
          attributes: {
            user: {
              create: {
                // NOTE: use for the demo only
                providerData: getUserData?.(providerData as any),
              },
            },
          },
        });
        return user;
      };

      const user = await getUser();
      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });
      const authRequest = auth.handleRequest(req, res);
      authRequest.setSession(session);

      // NOTE: this might be a deal breaker for us, since we need to redirect to a different domain
      return res
        .status(302)
        .setHeader("Location", "http://localhost:5173")
        .end();
    } catch (e) {
      if (e instanceof OAuthRequestError) {
        return res.status(400).json({
          success: false,
          message: "Invalid code",
        });
      }

      console.error(e);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  };
}

// Github

authRouter.get("/login/github", getLinkHandler(githubAuth, "github"));

authRouter.get(
  "/login/github/callback",
  getCallbackHandler<GithubAuth>(githubAuth, "github", (providerData) => {
    return providerData.githubUser;
  })
);

// Google

authRouter.get("/login/google", getLinkHandler(googleAuth, "google"));

authRouter.get(
  "/login/google/callback",
  getCallbackHandler<GoogleAuth>(googleAuth, "google", (providerData) => {
    return providerData.googleUser;
  })
);

// Discord

authRouter.get("/login/discord", getLinkHandler(discordAuth, "discord"));

authRouter.get(
  "/login/discord/callback",
  getCallbackHandler<DiscordAuth>(discordAuth, "discord", (providerData) => {
    return providerData.discordUser;
  })
);

app.use("/auth", authRouter);

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
