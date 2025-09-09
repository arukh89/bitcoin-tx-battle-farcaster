/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API configuration
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  
  // Webpack configuration for crypto libraries
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix for crypto modules in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };
    
    // Add Buffer global for browser
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'avatar.vercel.sh'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/battle',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Experimental features
  experimental: {
    appDir: false, // Set to true if using app directory
    serverComponentsExternalPackages: ['bitcoinjs-lib'],
  },
};

module.exports = nextConfig;
