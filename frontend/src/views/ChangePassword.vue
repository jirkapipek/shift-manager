<template>
  <div id="changePinForm">
    <h2 align="center">Change password</h2>

    <!-- Error alert -->
    <b-alert show dismissible fade variant="danger" v-if="error">{{
      error
    }}</b-alert>

    <!-- Form for change pin -->
    <b-form class="justify-content-center" @submit.prevent="changeUserPin">
      <b-input
        type="password"
        class="mb-2 mr-sm-2 mb-sm-2"
        v-model="password"
        placeholder="Actual password"
      ></b-input>
      <b-input
        type="password"
        class="mb-2 mr-sm-2 mb-sm-2"
        v-model="repeatPassword"
        placeholder="Repeat password"
      ></b-input>

      <!-- Password alert -->
      <b-alert
        show
        dismissible
        fade
        variant="danger"
        v-if="password !== repeatPassword"
        >Different passwords</b-alert
      >
      <b-input
        type="password"
        class="mb-2 mr-sm-2 mb-sm-2"
        v-model="newpassword"
        placeholder="New password"
      ></b-input>

      <b-button block variant="dark" type="submit">Change</b-button>
    </b-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      password: "",
      repeatPassword: "",
      newpassword: "",
      error: "",
    };
  },
  methods: {
    //load methods from VUEX store
    ...mapActions(["changePin"]),
    ...mapActions(["logout"]),

    //function for change password
    changeUserPin() {
      var passwordData = {
        password: this.password,
        newpassword: this.newpassword,
      };
      this.changePin(passwordData)
        .then(() => {
          this.logout( "Your password has been changed, plese log in!")
        })

        .catch((error) => {
          this.error = error.response.data.msg;
        });
    },
  },
};
</script>