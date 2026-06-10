/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Autoriser les images depuis Cloudinary
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
