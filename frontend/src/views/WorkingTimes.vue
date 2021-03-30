<template>
  <div id="workingTimes">
    <!--Button for adding new working time-->
    <b-button
      variant="success"
      v-if="edit !== true && add !== true && isAdmin"
      class="mb-2 mr-sm-2 mb-sm-2"
      @click="addNewWorkingTime()"
      >Add new working time</b-button
    >
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
    <b-input-group v-if="edit !== true && add !== true">
      <b-form-input
        class="mb-2 mr-sm-2 mb-sm-2"
        id="filter-input"
        v-model="keyword"
        type="search"
        placeholder="Search by name and hours"
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
        :items="workingTimes"
        :fields="fields"
        :filter="keyword"
        :busy="isBusy"
        head-variant="dark"
        responsive
        v-if="edit !== true && add !== true"
        ref="table"
      >
        <!-- Loading spinner, if app getting data from backend -->
        <template #table-busy>
          <div class="text-center text-dark my-2">
            <b-spinner variant="dark" class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>

        <!-- Custom table cell for toast with employees with working time -->
        <template #cell(show_employees)="row">
          <b-button
            size="sm"
            variant="dark"
            @click="row.toggleDetails"
            class="mr-2"
          >
            {{ row.detailsShowing ? "Hide" : "Show" }} employees
          </b-button>
        </template>

        <!-- Toast with employee details -->
        <template #row-details="row">
          <b-card>
            <span v-for="employee in row.item.employees" :key="employee.id">
              {{
                employee.name + " " + employee.lastname + " - " + employee.email
              }}
              <b> | </b>
            </span>
          </b-card>
        </template>

        <!-- Add custom cell for action buttons -->
        <template v-slot:cell(action)="data">
          <b-button block variant="dark" @click="editWorkingTime(data.item)"
            >Edit</b-button
          ><b-button block variant="danger" @click="remove(data.item)"
            >Delete</b-button
          >
        </template>
      </b-table>
    </div>

    <!-- Edit form for working time -->
    <div class="edit" v-if="edit == true">
      <h2>Edit working time</h2>
      <b-form
        class="justify-content-center"
        @submit.prevent="editWorkingTime(null)"
      >
        <b-input
          v-model="name"
          placeholder="Working time name"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-input
          v-model="hours"
          placeholder="Working hours"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-input
          v-model="holidayHours"
          required
          placeholder="Holiday hours"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-button block variant="dark" type="submit">Edit</b-button>
        <b-button block variant="outline-dark" @click="back()">Back</b-button>
      </b-form>
    </div>

    <!-- Adding form for working time -->
    <div class="edit" v-if="add == true">
      <h2>Add working time</h2>
      <b-form
        class="justify-content-center"
        @submit.prevent="addNewWorkingTime()"
      >
        <b-input
          v-model="name"
          placeholder="Working time name"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-input
          v-model="hours"
          placeholder="Working hours"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-input
          v-model="holidayHours"
          required
          placeholder="Holiday hours"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-button block variant="dark" type="submit">Add</b-button>
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
      keyword: null,
      edit: false,
      add: false,
      workingTimes: [],
      id: "",
      name: "",
      hours: "",
      holidayHours: "",
      message: "",
      isBusy: false,
      fields: [
        { key: "name", label: "Name", sortable: true },
        { key: "hours", label: "Working hours", sortable: true },
        { key: "holiday_hours", label: "Holiday hours", sortable: true },
        { key: "show_employees", label: "Employees", tdClass: "actionBar" },
      ],
    };
  },

  created() {
    //Load working times, if page is rendering
    this.loadWorkingTimes();
  },

  methods: {
    //Funciton for add new working time - only admin (Send request to server).
    addNewWorkingTime() {
      if (!this.add) {
        this.add = true;
      } else {
        var newWokingTime = {
          name: this.name,
          hours: this.hours,
          holiday_hours: this.holidayHours,
        };
        axios
          .post(
            process.env.VUE_APP_MAIN_PATH + "/api/workingtimes/new/",
            newWokingTime
          )
          .then((res) => {
            this.message = res.data.msg;
            this.name = "";
            this.hours = "";
            this.holidayHours = "";
          });
        this.$bvToast.show("my-toast");
        this.workingTimes = [];
        this.add = false;
        this.loadWorkingTimes();
      }
    },

    //Funciton for editing working time - only admin (Send request to server).
    editWorkingTime(workingTime) {
      //This condition set data from table to edit form, if edit == false
      if (!this.edit) {
        this.edit = true;
        this.id = workingTime._id;
        this.name = workingTime.name;
        this.hours = workingTime.hours;
        this.holidayHours = workingTime.holiday_hours;
      } else {
        var updatedWorkingTime = {
          name: this.name,
          hours: this.hours,
          holiday_hours: this.holidayHours,
        };

        axios
          .put(
            process.env.VUE_APP_MAIN_PATH +
              "/api/workingtimes/update/" +
              this.id,
            updatedWorkingTime
          )
          .then((res) => {
            this.name = "";
            this.hours = "";
            this.holidayHours = "";
            this.message = res.data.msg;
            this.$bvToast.show("my-toast");
            this.workingTimes = [];
            this.loadWorkingTimes();
            this.edit = false;
          });
      }
    },

    //Function for removing working time - only admin (Send request to server)
    async remove(workingTime) {
      axios
        .delete(
          process.env.VUE_APP_MAIN_PATH +
            "/api/workingtimes/delete/" +
            workingTime._id
        )
        .then((res) => {
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
          this.workingTimes = [];
          this.loadWorkingTimes();
        });
    },

    //Function for load data from server to table
    async loadWorkingTimes() {
      this.isBusy = true;
      this.workingTimes = await axios.get(
        process.env.VUE_APP_MAIN_PATH + "/api/workingtimes/all"
      );
      this.workingTimes = this.workingTimes.data;
      this.isBusy = false;
    },

    //This is function for back button in edit and add form
    back() {
      this.edit = false;
      this.add = false;
      this.name = "";
      this.hours = "";
      this.holidayHours = "";
    },
  },

  async mounted() {
    //add action bar for admins
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

    //Function for filtering data from table on name, hours and holiday hours
    filterList() {
      return this.keyword
        ? this.workingTimes.filter(
            (item) =>
              item.name.includes(this.keyword) ||
              item.hours.includes(this.keyword) ||
              item.holidayHours.includes(this.keyword)
          )
        : this.workingTimes;
    },
  },
};
</script>

<style>
</style>