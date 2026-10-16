import { Settings } from '@ant-design/pro-layout';

export default {
  navTheme: 'light',
  layout: 'top',
  contentWidth: 'Fluid',
  fixSiderbar: true,
  colorWeak: false,
  title: `${process.env.SITE_NAME}`,
  token: {
    layout: {
      bgLayout: '#F0F2F5',
    },
    header: {
      colorBgHeader: '#1677ff',
      colorHeaderTitle: '#ffffff',
      colorTextMenu: 'rgba(255, 255, 255, 0.7)',
      colorTextMenuActive: '#ffffff',
      heightLayoutHeader: 64,
    },
    pageContainer: {
      paddingBlockPageContainerContent: 16,
      paddingInlinePageContainerContent: 24,
    },
  },
} as Settings;
