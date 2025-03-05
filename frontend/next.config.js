/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // Ignora erros de tipo durante a construção (produção)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora erros de linting durante a construção (produção)
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals = [
      ...(config.externals || []),
      {
        'formidable': 'commonjs formidable',
      }
    ];
    return config;
  },
}

module.exports = nextConfig
