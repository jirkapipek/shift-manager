<template>
  <div id="profile">

    <!-- Simple table with user profile -->
    <table>
      <tr>
        <td colspan="2" style="text-align: center">
          <b-avatar size="10em"></b-avatar>
        </td>
      </tr>
      <tr>
        <td><b>Name:</b></td>
        <td>{{ user.user.name + " " + user.user.lastname }}</td>
      </tr>
      <tr>
        <td><b>Email:</b></td>
        <td>{{ user.user.email }}</td>
      </tr>
      <tr v-if="user.user.workingTime">
        <td><b>Working time:</b></td>
        <td>
          {{ user.user.workingTime.name + " - " + user.user.workingTime.hours }}
        </td>
      </tr>
      <tr v-if="user.user.workingTime">
        <td><b>Holiday hours:</b></td>
        <td>{{ user.user.workingTime.holiday_hours }}</td>
      </tr>
      <tr v-if="user.user.position">
        <td><b>Position:</b></td>
        <td>
          {{ user.user.position.name }} - {{
            user.user.position.default_salary }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      users: "",
      edit: false,
      name: "",
      lastname: "",
      position_specs: "",
      email: "",
    };
  },
  computed: {
    //load user details from VUEX store
    ...mapGetters(["user"]),
  },
};
</script>

<style>
</style>