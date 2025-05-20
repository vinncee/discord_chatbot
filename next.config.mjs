/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Discord.js doesn't work well with webpack by default
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'zlib-sync': 'commonjs zlib-sync',
      'erlpack': 'commonjs erlpack',
      '@discordjs/opus': 'commonjs @discordjs/opus',
    })
    
    return config
  },
}

export default nextConfig
