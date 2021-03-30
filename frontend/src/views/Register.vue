<template>
  <div id="registerForm">
    <h2 align="center">Register employee</h2>

    <!-- Toast with announcement -->
    <b-toast id="my-toast" variant="success" solid>
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <b-img
            blank
            blank-color="green"
            class="mr-2"
            width="12"
            height="12"
          ></b-img>
          <strong class="mr-auto">Message!</strong>
          <small class="text-muted mr-2">now</small>
        </div>
      </template>
      {{ message }}
    </b-toast>

    <!-- Error alert -->
    <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>

    <!-- Register form -->
    <b-form class="justify-content-center" @submit.prevent="registerUser">
      <b-input
        v-model="name"
        class="mb-2 mr-sm-2 mb-sm-2"
        placeholder="Name"
      ></b-input>
      <b-input
        v-model="lastname"
        class="mb-2 mr-sm-2 mb-sm-2"
        placeholder="Lastname"
      ></b-input>
      <b-input
        v-model="email"
        required
        type="email"
        class="mb-2 mr-sm-2 mb-sm-2"
        placeholder="Email"
      ></b-input>
      <b-form-group id="role">
        <b-form-select
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="role"
          :options="roles"
          required
        ></b-form-select>
        <b-form-select
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="position"
          :options="positions"
          required
        ></b-form-select>
        <b-button
          block
          variant="outline-warning"
          class="mb-2 mr-sm-2 mb-sm-2"
          to="/positions"
          >Add position</b-button
        >
        <b-form-select
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="workingTime"
          :options="workingTimes"
          required
        ></b-form-select>
        <b-button
          block
          variant="outline-warning"
          class="mb-2 mr-sm-2 mb-sm-2"
          to="/workingtimes"
          >Add working time</b-button
        >
      </b-form-group>

      <b-button block variant="dark" type="submit">Register</b-button>
    </b-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      message: "",
      name: "",
      lastname: "",
      email: "",
      error: "",
      role: null,
      roles: [
        { text: "Choose role..", value: null },
        { text: "Manager", value: "manager" },
        { text: "Employee", value: "employee" },
      ],
      position: null,
      positions: [{ text: "Choose position", value: null }],
      workingTime: null,
      workingTimes: [{ text: "Choose working time", value: null }],
    };
  },
  computed: {
    //Getters from VUEX store for user administration
    ...mapGetters(["isAdmin"]),
    ...mapGetters(["isManager"]),
    ...mapGetters(["user"]),
  },
  created() {
    //Load selects from database (load working times and positions)
    this.setSelects();
  },
  methods: {
    //Load method for register from VUEX store
    ...mapActions(["register"]),

    //Function for register user
    registerUser() {
      this.error = "";
      let user = {
        name: this.name,
        lastname: this.lastname,
        email: this.email,
        position: this.position,
        workingTime: this.workingTime,
        role: this.role,
      };
      this.register(user)
        .then((res) => {
          if (res.data.success) {
            this.message = res.data.msg;
            this.$bvToast.show("my-toast");
            this.name = "";
            this.lastname = "";
            this.email = "";
            this.role = null;
            this.position = null;
            this.workingTime = null;
          }
        })
        .catch((error) => {
          this.error = error.response.data.msg;
        });
    },

    //function for load data to selects, (position and working time)
    async setSelects() {
      axios.get(process.env.VUE_APP_MAIN_PATH+"/api/jobpositions/all").then((res) => {
        for (var i = 0; i < res.data.length; i++) {
          this.positions.push({
            text: res.data[i].name,
            value: res.data[i]._id,
          });

        }
      });

      axios.get(process.env.VUE_APP_MAIN_PATH+"/api/workingtimes/all").then((res) => {
        for (var i = 0; i < res.data.length; i++) {
          this.workingTimes.push({
            text: res.data[i].name,
            value: res.data[i]._id,
          });
        }
      });

      //set role select for admin - only admin can register other admin
      if (this.user.user.role == "admin") {
        this.roles.push({ text: "Administrator", value: "admin" });
      }
    },
  },
};
</script>