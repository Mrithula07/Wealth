import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only import ArcJet dynamically to reduce bundle size
let aj;
if (process.env.VERCEL_ENV) {
  const arcjet = require("@arcjet/next");
  aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      arcjet.shield({ mode: "LIVE" }),
      arcjet.detectBot({
        mode: "DRY_RUN", // logging only, reduces blocking
        allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
      }),
    ],
  });
}

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

// Only chain ArcJet if loaded
const middleware = aj ? aj.middleware.bind(aj) : clerk;

export default async function handler(req) {
  return middleware(req, clerk);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
