<template>
  <div id="app">
    <div id="nav">
      <Navbar />
      <!-- <router-link to="/">Home</router-link> -->
    </div>
    <router-view />
    <Footer />
  </div>

</template>
<script>
import Navbar from "@/components/Navbar";
import axios from "axios";
import store from "./store";
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    Footer
  },
  watch: {
    $route(to) {
      document.title = to.meta.title || "Your Website";
    },
  },
  created: function () {
  axios.interceptors.response.use(undefined, function (err) {
    return new Promise(function () {
      if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
      // if you ever get an unauthorized, logout the user
        store.dispatch('logout', 'Your password expired, Please log in again!');
      // you can also redirect to /login if needed !
      }
      throw err;
    });
  });
},
};
</script>
<style>
</style>
