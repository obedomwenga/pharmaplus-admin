/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    return config;
  },
  // Add tracing to help debug routing issues
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Log routes and redirects during build
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig; 