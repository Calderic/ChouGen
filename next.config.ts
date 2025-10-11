import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // MUI 模块化导入优化
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // 编译优化
  compiler: {
    emotion: {
      sourceMap: false, // 生产环境关闭 sourcemap，减小体积
    },
  },

  // 实验性功能 - 优化包导入
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'recharts', 'date-fns'],
  },

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'], // 使用现代图片格式
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天缓存
  },

  // 性能优化配置
  poweredByHeader: false, // 移除 X-Powered-By 头，略微减小响应大小

  // 压缩优化
  compress: true, // 启用 gzip 压缩
};

export default nextConfig;
