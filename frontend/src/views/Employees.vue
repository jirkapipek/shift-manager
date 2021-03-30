<template>
  <div id="employees">
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

    <!-- Search ipnut for filtering data from table -->
    <b-input-group v-if="!edit">
      <b-form-input
        class="mb-2 mr-sm-2 mb-sm-2"
        id="filter-input"
        v-model="keyword"
        type="search"
        placeholder="Search by name, lastname and email"
      ></b-form-input>
      <b-input-group-append>
        <b-button
          class="mb-2 mr-sm-2 mb-sm-2"
          :disabled="!keyword"
          @click="keyword = ''"
          >Clear</b-button
        >
      </b-input-group-append>
    </b-input-group>

    <div class="resp-table">
      <!-- Table -->
      <b-table
        :items="items"
        :fields="fields"
        :filter="keyword"
        :busy="isBusy"
        head-variant="dark"
        v-if="edit == false"
        ref="table"
        responsive
      >
        <!-- Loading spinner, if app getting data from backend -->
        <template #table-busy>
          <div class="text-center text-dark my-2">
            <b-spinner variant="dark" class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>
        <!-- Add action buttons to table -->
        <template v-slot:cell(action)="data">
          <b-button block variant="dark" @click="editUser(data.item)"
            >Edit</b-button
          ><b-button block variant="warning" @click="resetPassword(data.item)"
            >Reset password</b-button
          ><b-button block variant="danger" @click="remove(data.item)"
            >Delete</b-button
          >
        </template>
      </b-table>
    </div>

    <!-- Edit form for user -->
    <div class="edit" v-if="edit == true">
      <h2>Edit user</h2>
      <b-form class="justify-content-center" @submit.prevent="editUser(null)">
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
        <b-form-group>
          <b-form-select
            v-model="role"
            :options="roles"
            required
          ></b-form-select>
        </b-form-group>
        <b-form-group>
          <b-form-select
            required
            v-model="position"
            :options="positions"
          ></b-form-select>
        </b-form-group>
        <b-form-group>
          <b-form-select
            required
            v-model="workingTime"
            :options="workingTimes"
          ></b-form-select>
        </b-form-group>
        <b-button block variant="dark" type="submit">Edit</b-button>
        <b-button block variant="outline-dark" @click="back()">Back</b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  data() {
    return {
      users: [],
      keyword: null,
      edit: false,
      isBusy: false,
      id: "",
      name: "",
      lastname: "",
      email: "",
      message: "",
      position: null,
      positions: [{ text: "Choose position", value: null }],
      workingTime: null,
      workingTimes: [{ text: "Choose working time", value: null }],
      role: null,
      roles: [
        { text: "Choose role..", value: null },
        { text: "Administrator", value: "admin" },
        { text: "Manager", value: "manager" },
        { text: "Employee", value: "employee" },
      ],
      fields: [
        { key: "firstname", label: "First Name", sortable: true },
        { key: "lastname", label: "Last Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "role", label: "Role", sortable: true },
        { key: "position", label: "Position", sortable: true },
        { key: "workingTime", label: "Working time", sortable: true },
      ],
      items: [],
    };
  },

  created() {
    //Loading working times and positions, if page is rendered
    this.setProperties();
    this.loadUsers();
  },

  methods: {

    //Funciton for editing user. (Set variables and send to VUEX store)
    editUser(user) {
      if (!this.edit) {
        this.edit = true;
        this.id = user._id;
        this.name = user.firstname;
        this.lastname = user.lastname;
        this.role = this.roles.find(({ text }) => text === user.role).value;
        this.position = user.positionId === undefined ? null : user.positionId;
        this.workingTime =
          user.workingTimeId === undefined ? null : user.workingTimeId;
        this.email = user.email;
      } else {
        let user = {
          _id: this.id,
          name: this.name,
          lastname: this.lastname,
          email: this.email,
          role: this.role,
          position: this.position,
          workingTime: this.workingTime,
        };
        
        axios
          .put(
            process.env.VUE_APP_MAIN_PATH +
              "/api/users/update/" +
              this.id,
            user
          ).then(res => {
          this.items = [];
          this.loadUsers();
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
          this.edit = false;
        });
      }
    },

    //Function for removing user - only admin (Send request to server)
    async remove(user) {
      axios
        .delete(process.env.VUE_APP_MAIN_PATH + "/api/users/delete/" + user._id)
        .then((res) => {
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
          this.items = [];
          this.loadUsers();
        });
    },

    //Function for reset user password - only admin (Send request to server)
    async resetPassword(user) {
      axios
        .post(
          process.env.VUE_APP_MAIN_PATH + "/api/users/resetpassword/" + user._id
        )
        .then((res) => {
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
        });
    },

    //Function for load data from server to table, solve undefined variables from database
    async loadUsers() {
      this.isBusy = true;
      await axios.get(
        process.env.VUE_APP_MAIN_PATH + "/api/users/"
      ).then(users => {
      users = users.data;
      for (var i = 0; i < users.length; i++) {
        if (users[i].position && users[i].workingTime) {
          let item = {
            _id: users[i]._id,
            positionId: users[i].position._id,
            workingTimeId: users[i].workingTime._id,
            firstname: users[i].name,
            lastname: users[i].lastname,
            role: this.roles.find(({ value }) => value === users[i].role)
              .text,
            email: users[i].email,
            position: users[i].position.name,
            workingTime: users[i].workingTime.name,
          };
          this.items.push(item);
        } else {
          let item = {
            _id: users[i]._id,
            firstname: users[i].name,
            lastname: users[i].lastname,
            role: this.roles.find(({ value }) => value === users[i].role)
              .text,
            email: users[i].email,
            position: "Not defined",
            workingTime: "Not defined",
          };
          this.items.push(item);
        }
      }
      }).catch(() => {});

      this.isBusy = false;
    },

    //Load working times and job positions to bootstrap selects for editing user.
    async setProperties() {
      axios
        .get(process.env.VUE_APP_MAIN_PATH + "/api/jobpositions/all")
        .then((res) => {
          for (var i = 0; i < res.data.length; i++) {
            this.positions.push({
              text: res.data[i].name,
              value: res.data[i]._id,
            });
          }
        }).catch(() => {
        });

      axios
        .get(process.env.VUE_APP_MAIN_PATH + "/api/workingtimes/all")
        .then((res) => {
          for (var i = 0; i < res.data.length; i++) {
            this.workingTimes.push({
              text: res.data[i].name,
              value: res.data[i]._id,
            });
          }
        }).catch(() => {
        });
    },

    back() {
      this.edit = false;
      this.add = false;
      this.name = "";
      this.lastname = "";
      this.email = "";
      this.workingTime = "";
      this.position = "";
      this.role = "";
    },
  },

  async mounted() {
    //solve action bar for admin and manager
    if (this.isAdmin) {
      this.fields.push({
        key: "action",
        label: "Action",
        tdClass: "actionBar",
      });
    }
  },

  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapGetters(["isManager"]),

    //Function for filtering data from table on name, lastname and email
    filterList() {
      return this.keyword
        ? this.items.filter(
            (item) =>
              item.firstname.includes(this.keyword) ||
              item.lastname.includes(this.keyword) ||
              item.email.includes(this.keyword)
          )
        : this.items;
    },
  },
};
</script>

<style>
</style>