import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

const routes = [

  { path: '*', 
  component: () => import(/* webpackChunkName: "about" */ '../views/NotFound.vue'),
  },
  {
    path: '/',
    name: 'login',
    meta:{title: 'Log in', requiresGuest: true},
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    meta:{title: 'Log in', requiresGuest: true},
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    meta:{title: 'Register employee', requiresManager: true},
    component: () => import(/* webpackChunkName: "about" */ '../views/Register.vue')
  }
  ,
  {
    path: '/profile',
    name: 'Profile',
    meta:{title: 'My profile', requiresAuth: true},
    component: () => import(/* webpackChunkName: "about" */ '../views/Profile.vue'),
  },
  {
  path: '/employees',
  name: 'Employees',
  meta:{title: 'All empoloyees', requiresManager: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/Employees.vue'),
},
{
  path: '/workingtimes',
  name: 'Working Times',
  meta:{title: 'All working times', requiresManager: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/WorkingTimes.vue'),
},
{
  path: '/positions',
  name: 'Job positons',
  meta:{title: 'All job positions', requiresManager: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/Positions.vue'),
},
{
  path: '/requests',
  name: 'Shift requests',
  meta:{title: 'Shift requests', requiresEmployee: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/ShiftRequestsEmployee.vue'),
},
{
  path: '/shifts',
  name: 'Shifts',
  meta:{title: 'Shifts', requiresEmployee: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/ShiftsEmployee.vue'),
},
{
  path: '/mngrequests',
  name: 'Manage requests',
  meta:{title: 'Manage shift requests', requiresManager: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/ShiftRequestsMng.vue'),
},
{
  path: '/mngshifts',
  name: 'Manage shifts',
  meta:{title: 'Manage shifts', requiresManager: true},
  component: () => import(/* webpackChunkName: "about" */ '../views/ShiftsMng.vue'),
},
  {
    path: '/changepassword',
    name: 'Change password',
    meta:{title: 'Change password', requiresAuth: true},
    component: () => import(/* webpackChunkName: "about" */ '../views/ChangePassword.vue'),

  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)){
    if(!store.getters.isLoggedIn){
      //redirect to the login page
      next('/login')
    }else{
      next();
    }
  }else if(to.matched.some(record => record.meta.requiresGuest)){

    if(store.getters.isLoggedIn){
      next('/profile')
    }else{
      next();
    }

  }else if(to.matched.some(record => record.meta.requiresManager)){
    if(store.getters.isLoggedIn && (store.getters.isAdmin || store.getters.isManager)){
      next();
    }else{
    next('/login')
  }
  
  }else if(to.matched.some(record => record.meta.requiresEmployee)){
    if(store.getters.isLoggedIn && store.getters.user.user.role == 'employee'){
      next();
    }else{
      next('/profile');
    }

  }else{
    next()
  }
});

export default router;
