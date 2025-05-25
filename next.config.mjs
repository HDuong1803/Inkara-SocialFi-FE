/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'plus.unsplash.com',
      'images.unsplash.com',
      'localhost',
      'res.cloudinary.com',
      'gateway.pinata.cloud',
      'ipfs.io',
      'arweave.net'
    ],
  },
  output: 'standalone',
};

export default nextConfig;
