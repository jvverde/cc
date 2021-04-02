
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/Index.vue') },
      { path: 'monitor', name: 'monitor', component: () => import('pages/Monitor.vue') },
      { path: 'keys', name: 'keys', component: () => import('pages/Keys.vue') },
      { path: 'charts/:symbol', props: true, name: 'charts', component: () => import('pages/Charts.vue') }
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
