/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/Conway-Game-of-Life" : "",
  reactStrictMode: process.env.NODE_ENV === "production" ? false : true,
};

export default nextConfig;
