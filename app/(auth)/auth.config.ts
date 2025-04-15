import type { NextAuthConfig } from "next-auth";
import { getToken } from "next-auth/jwt";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    async authorized({ auth, request }) {
      let isLoggedIn = !!auth?.user;
      let token = null;
      if (isLoggedIn) {
        token = await getToken({
          req: request,
          secret: process.env.AUTH_SECRET,
          secureCookie: process.env.SECURE_COOKIE === "true",
        });
        // For legacy tokens without registrationComplete, force a re-login.
        if (token?.registrationComplete == null) {
          isLoggedIn = false;
        }
      }
      const pathname = request.nextUrl.pathname;

      const isOnOAuthRegister = pathname.startsWith("/register/oauth");
      const isOnRegister = pathname === "/register";
      const isOnLogin = pathname.startsWith("/login");
      const isOnForgotPassword = pathname.startsWith("/forgot-password");
      const isOnAboutUs = pathname === "/about-us";
      const isOnWelcome = pathname === "/welcome"; // new public page
      const isAuth = pathname.startsWith("/api/auth");

      const isOnPublicPage =
        isOnRegister ||
        isOnLogin ||
        isOnForgotPassword ||
        isOnAboutUs ||
        isOnWelcome;

      // Check if the requested pathname is the root "/"
      const isRoot = pathname === "/";
      const isSelectModel = pathname === "/select-model";
      const hasModelParam = request.nextUrl.searchParams.has("model-id");

      // For logged-in users accessing the root "/"
      if (isRoot && isLoggedIn) {
        // If “stay=true” is present, allow staying on “/”
        const stayParam = request.nextUrl.searchParams.get("stay") === "true";
        if (!stayParam) {
          // Check if we're coming from the model selection or dashboard
          const referer = request.headers.get("referer");
          const isFromModelSelection = referer && referer.includes("/select-model");

          if (!referer || (!referer.includes("/dashboard") && !isFromModelSelection)) {
            return Response.redirect(
              new URL("/dashboard", request.nextUrl as unknown as URL)
            );
          }
        }
        // Otherwise allow staying on “/”
        return true;
      }


      // Allow model selection page to work properly
      if (isSelectModel && hasModelParam && isLoggedIn) {
        return true;
      }

      // For OAuth registration, if not logged in, redirect to /welcome.
      if (isOnOAuthRegister && !isLoggedIn) {
        return Response.redirect(new URL("/welcome", request.nextUrl));
      }

      if (isLoggedIn && isOnPublicPage) {
        return Response.redirect(new URL("/dashboard", request.nextUrl as unknown as URL));
      }

      // Allow public pages and API auth requests
      if (isOnPublicPage || isAuth) {
        return true;
      }

      if (isLoggedIn) {
        // If registration is incomplete, force the OAuth registration flow.
        if (!!!token?.registrationComplete && !isOnOAuthRegister) {
          return Response.redirect(
            new URL("/register/oauth", request.nextUrl)
          );
        }
        // Allow authenticated users access to protected pages
        return true;
      } else {
        // For any other protected route, redirect unauthenticated users to /welcome.
        return Response.redirect(
          new URL("/welcome", request.nextUrl as unknown as URL)
        );
      }
    },
  },
} satisfies NextAuthConfig;
