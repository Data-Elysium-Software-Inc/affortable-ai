'use client';

// app/register/oauth/layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}