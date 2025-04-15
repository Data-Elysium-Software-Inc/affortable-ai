import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google'

import { createUser, getUser } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        if (users[0].registrationType !== 'email') return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        users[0].registrationComplete = true; // Hard coding the value

        return users[0] as any;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {

        const users = await getUser(user.email as string);

        if (users.length === 0) {
          await createUser(user.email as string, false, 'google');
          user.registrationComplete = false;
          const newUser = await getUser(user.email as string);
          user.id = newUser[0].id;
          user.email = newUser[0].email
        }
        else {
          user.registrationComplete = users[0].registrationComplete;
          user.id = users[0].id;
          user.email = users[0].email;
        }

        // This was done to match the behaviour 
        // with credentials provider. The credentials 
        // provider doens't set a name and image in the 
        // session object. We are doing the same here
        user.name = undefined;
        user.image = undefined;

        return true;
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.registrationComplete = user.registrationComplete;
      }
      if (trigger === 'update') {
        token.registrationComplete = session.user.registrationComplete;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.registrationComplete = token.registrationComplete;
      }

      return session;
    },
  },
});