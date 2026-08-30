/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["wagmi", "viem", "@wagmi/core"],
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "bufferutil", "utf-8-validate");
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
