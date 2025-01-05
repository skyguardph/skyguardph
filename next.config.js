/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': './components',
      '@lib': './lib',
      '@styles': './styles'
    }
    return config
  }
}

module.exports = nextConfig
