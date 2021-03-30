<template>
    <div>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-brand to="/">ShiftManager</b-navbar-brand>

    <b-navbar-toggle target="nav-collapse" v-if="isLoggedIn"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav v-if="isLoggedIn">
      <b-navbar-nav class="ml-auto">

        <b-nav-item-dropdown right v-if="isLoggedIn">
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content exact exact-active-class="active"> 
            Shifts
          </template>
          <b-dropdown-item to="/requests" v-if="isEmployee" exact exact-active-class="active">My requests</b-dropdown-item>
          <b-dropdown-item to="/shifts" v-if="isEmployee" exact exact-active-class="active">My shifts</b-dropdown-item>
          <b-dropdown-item to="/mngrequests" v-if="isAdmin || isManager" exact exact-active-class="active">Shift requests</b-dropdown-item>
          <b-dropdown-item to="/mngshifts" v-if="isAdmin || isManager">All shifts</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown right v-if="isLoggedIn && (isAdmin || isManager)">
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            Employees
          </template>
          <b-dropdown-item to="/employees" exact exact-active-class="active">All employees</b-dropdown-item>
          <b-dropdown-item to="/register" exact exact-active-class="active">Register emploeyee</b-dropdown-item>
        </b-nav-item-dropdown>
      <!-- Right aligned nav items -->
        <b-nav-item-dropdown right v-if="isLoggedIn && (isAdmin || isManager)">
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            Settings
          </template>
          <b-dropdown-item to="/workingtimes" exact exact-active-class="active">Working times</b-dropdown-item>
          <b-dropdown-item to="/positions" exact exact-active-class="active">Positions</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown right v-if="isLoggedIn">
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em><b-avatar size=1.5em></b-avatar> - {{user.user.name +" "+user.user.lastname}}</em>
          </template>
          <b-dropdown-item to="/profile" exact exact-active-class="active">Profile</b-dropdown-item>
          <b-dropdown-item to="/changepassword" exact exact-active-class="active">Change password</b-dropdown-item>
          <b-dropdown-item to="/logout" @click.prevent="logoutUser">Log out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>
</template>

<script>
import{mapGetters, mapActions} from "vuex";
export default {
   data(){
        return{
            name: "",
            lastname: "",
            email: "",
            }
          },
    computed:{
        ...mapGetters(["isLoggedIn"]),
        ...mapGetters(["user"]),
        ...mapGetters(["isAdmin"]),
        ...mapGetters(["isManager"]),
        ...mapGetters(["isEmployee"]),

    },
    methods:{
        ...mapActions(['logout']),
        logoutUser(){
            this.logout();
        }
    }
}
</script>

<style>

</style>
