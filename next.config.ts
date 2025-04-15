import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: true,
  },
  images: {
    domains: [
      "avatar.vercel.sh", // ✅ Allow avatar images from Vercel
      "qwaozke1foqjng3h.public.blob.vercel-storage.com", // ✅ Your Vercel Blob Storage
      "https://www.pngkey.com/", // ✅ External domain
    ],
    remotePatterns: [
      {
        protocol: "https", // ✅ Specify protocol to allow external images
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "qwaozke1foqjng3h.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "www.pngkey.com",
      },
    ],
  },
};

export default nextConfig;
