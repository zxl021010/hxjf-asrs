import { Settings } from '@ant-design/pro-layout';

export default {
  navTheme: 'light',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixSiderbar: true,
  splitMenus: false,
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
    sider: {
      colorBgMenuItemSelected: '#E6F4FF',
      colorTextMenuSelected: '#1677FF',
      colorTextMenu: '#595959',
      colorBgMenuItemHover: '#F5F5F5',
    },
    pageContainer: {
      paddingBlockPageContainerContent: 16,
      paddingInlinePageContainerContent: 24,
    },
  },
} as Settings;
