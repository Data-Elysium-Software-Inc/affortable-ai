import React, { type ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react"; // or any icon library you prefer

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto my-8 max-w-3xl px-4 h-[calc(100vh-100px)] overflow-y-auto">
      {/* Shared header */}
      <header className="mb-8 border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Our Blog</h1>
          <p className="text-gray-500">Read the latest articles and updates.</p>
        </div>

        {/* Home icon */}
        <Link href="/">
          <Home className="w-6 h-6 text-white-500 hover:text-gray-500" />
        </Link>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-8 border-t pt-4">
        <p className="text-center text-sm text-gray-500">
          © 2025 Affortable AI. All rights reserved.
        </p>
      </footer>
    </section>
  );
}
