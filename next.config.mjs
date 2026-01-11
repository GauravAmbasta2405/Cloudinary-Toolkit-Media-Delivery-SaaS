/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "cloudinary"],
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/**/*"],
  },
};

export default nextConfig;
