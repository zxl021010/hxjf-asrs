const proxy: Record<string, Record<string, { target: string; changeOrigin: boolean }>> = {
  dev: {
    '/api': {
      target: 'http://wms-mng-test.wgit123.com',
      changeOrigin: true,
    },
  },
};

export default proxy;
