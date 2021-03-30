<template>
  <div id="loginForm">
    <h2 align="center">Log in</h2>

    <!-- Alert with errors -->
    <b-alert show dismissible fade variant="danger" v-if="error">{{
      error
    }}</b-alert>

    <!-- Alert with errors -->
    <b-alert show dismissible fade variant="info" v-if="this.$route.query.msg">
      {{ this.$route.query.msg }}</b-alert
    >
    <b-alert
      show
      dismissible
      fade
      variant="danger"
      v-if="this.$route.query.msgErr"
    >
      {{ this.$route.query.msgErr }}</b-alert
    >

    <!-- Log in form -->
    <b-form class="justify-content-center" @submit.prevent="loginUser">
      <b-input
        type="email"
        id="email"
        v-model="email"
        name="email"
        required
        class="mb-2 mr-sm-2 mb-sm-2"
        placeholder="Email"
      ></b-input>
      <b-input
        type="password"
        class="mb-2 mr-sm-2 mb-sm-2"
        id="password"
        name="password"
        v-model="password"
        placeholder="Password"
      ></b-input>
      <b-button block variant="dark" type="submit">Log in</b-button>
      <b-button
        style="mb-2; margin-bottom: 3%"
        block
        variant="primary"
        @click="$bvToast.show('example-toast')"
      >
        Forgotten password?
      </b-button>
      <b-toast
        id="example-toast"
        title="Forgotten password"
        static
        no-auto-hide
      >
        If you have forgotten your password, contact the administrator!
      </b-toast>
    </b-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    //Load method for login from VUEX store
    ...mapActions(["login"]),

    //Function for login user
    loginUser() {
      var user = {
        email: this.email,
        password: this.password,
      };

      this.login(user)
        .then(() => {
          this.$router.push("/profile");
        })
        .catch((error) => {
          this.error = error.response.data.msg;
        });
    },
  },
};
</script>