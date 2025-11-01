/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@digital-astrology/lib", "@digital-astrology/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

module.exports = nextConfig;
