export default [
  {
    path: '/login',
    component: '@/pages/login/index',
    layout: false,
  },
  {
    path: '/',
    redirect: '/warehouse',
  },
  {
    path: '/warehouse',
    name: '库存总览',
    icon: 'AppstoreOutlined',
    component: '@/pages/warehouse',
  },
  {
    path: '/task',
    name: '出入库记录',
    icon: 'SwapOutlined',
    component: '@/pages/task',
  },
  {
    path: '/exception',
    name: '异常',
    icon: 'WarningOutlined',
    component: '@/pages/exception',
  },
  {
    path: '/log',
    name: '操作日志',
    icon: 'FileTextOutlined',
    component: '@/pages/log',
  },
];
