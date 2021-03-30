import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'
//import axios from 'axios'

require('@/store/subscriber');

Vue.config.productionTip = false

import "./assets/global.css"

store.dispatch('attempt', localStorage.getItem('token')).then(()=>{

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
