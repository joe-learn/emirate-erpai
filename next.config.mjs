/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vgyvsolrkdrbeqaczuru.supabase.co" },
    ],
  },
};

export default nextConfig;
