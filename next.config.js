/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/Conway-Game-of-Life" : "",
  output: "export",
  reactStrictMode: true
};

export default nextConfig;
