
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/Index.vue') },
      { path: 'monitor', name: 'monitor', component: () => import('pages/Monitor.vue') },
      { path: 'keys', name: 'keys', component: () => import('pages/Keys.vue') },
      { path: 'settings', name: 'settings', component: () => import('pages/Settings.vue') },
      {
        path: 'charts',
        name: 'charts',
        component: () => import('pages/Charts.vue'),
        children: [{
          path: 'show/:symbol',
          props: true,
          name: 'showchart',
          component: () => import('pages/Chart.vue')
        }]
      },
      { path: 'chart/:symbol', props: true, name: 'chart', component: () => import('pages/Chart.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
