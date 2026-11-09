/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/tools/barcode',
        destination: '/tools/barcode-maker',
        permanent: true,
      },
      {
        source: '/tools/qrcode',
        destination: '/tools/qr-maker',
        permanent: true,
      },
      {
        source: '/tools/qr',
        destination: '/tools/qr-maker',
        permanent: true,
      },
      {
        source: '/tools/signature',
        destination: '/tools/email-signature',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
