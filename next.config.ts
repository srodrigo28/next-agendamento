// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicionamos esta secção para configurar as imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Aqui colocamos o hostname exato do seu Supabase Storage
        hostname: 'evwcbgcyhqfajuwifret.supabase.co',
        port: '',
        // O pathname permite especificar de qual caminho as imagens podem vir
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // A sua configuração de headers (CORS), se existir, pode continuar aqui.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
