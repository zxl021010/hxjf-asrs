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
    name: '货仓',
    component: '@/pages/warehouse',
  },
  {
    path: '/task',
    name: '任务',
    component: '@/pages/task',
  },
  {
    path: '/exception',
    name: '异常',
    component: '@/pages/exception',
  },
  {
    path: '/log',
    name: '日志',
    component: '@/pages/log',
  },
];
