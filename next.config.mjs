/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    // Keep your existing domains if you are using them
    domains: ['firebasestorage.googleapis.com',"ik.imagekit.io"], 
    
    // Add new domains to remotePatterns for better security
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "aigurulab.tech", // Add this for your AI images
      },
    ],
  },
 
};

export default nextConfig;
