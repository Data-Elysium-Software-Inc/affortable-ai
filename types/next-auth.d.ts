import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            registrationComplete: boolean;
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        registrationComplete: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        registrationComplete: boolean;
    }
}