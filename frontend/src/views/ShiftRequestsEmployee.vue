<template>
  <div id="requests">
    <!--Button for adding new shift request-->
    <b-button
      variant="success"
      v-if="edit !== true && add !== true"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="addRequest()"
      >Add a new shift request</b-button
    >

    <!--Help button for employees-->
    <b-button
      variant="outline-dark"
      v-if="edit !== true && add !== true"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="$bvToast.show('help-toast')"
      >Help</b-button
    >
    <b-toast id="help-toast" title="Shift helper" static no-auto-hide>
      <p>
        You can submit your shift requests on this page. If you have time all
        day, enter the time from 00:00 to 23:59. The shift can only be entered
        for one day, if you want to do a night shift, you must divide the shifts
        into two days.
      </p>
    </b-toast>

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
      <b-form-datepicker
        class="mb-2 mr-sm-2 mb-sm-2"
        id="filter-input"
        v-model="keyword"
        locale="en"
        placeholder="Choose a date for filter shifts"
      ></b-form-datepicker>
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
        :items="requests"
        :fields="fields"
        :filter="keyword"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
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

        <!-- Add custom cell for action buttons -->
        <template v-slot:cell(action)="data">
          <b-button v-if="new Date(data.item.date).getTime() > maxEditDate.getTime()"  block variant="dark" @click="editRequest(data.item)"
          >Edit</b-button
          ><b-button v-if="new Date(data.item.date).getTime() > maxEditDate.getTime()" block variant="danger" @click="remove(data.item)"
            >Delete</b-button
          >
          <p v-if="new Date(data.item.date).getTime() < maxEditDate.getTime()" style="text-align: center">Waiting for approval!</p>
        </template>
      </b-table>
    </div>

    <!-- Edit form for requests -->
    <div class="edit" v-if="edit == true">
      <h2>Edit shift request<br />{{ date }}</h2>

      <!-- Error alert -->
      <b-alert show dismissible fade variant="danger" v-if="error">{{
        error
      }}</b-alert>
      <b-form
        class="justify-content-center"
        @submit.prevent="editRequest(null)"
      >
        <b-form-timepicker
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="timeFrom"
          locale="cs"
          placeholder="Choose time from:"
        ></b-form-timepicker>
        <b-form-timepicker
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="timeTo"
          locale="cs"
          placeholder="Choose time to:"
          value="23:50"
        ></b-form-timepicker>

        <!-- Real time error alert - checking right time -->
        <b-alert show dismissible fade variant="danger" v-if="timeFrom > timeTo"
          >Your shift must start earlier than ends. (Start &lt; End)</b-alert
        >
        <b-button block variant="dark" type="submit">Edit</b-button>
        <b-button block variant="outline-dark" @click="back()">Back</b-button>
      </b-form>
    </div>

    <!-- Adding form for requests -->
    <div class="edit" v-if="add == true">
      <h2>Add new shift request</h2>
      <b-alert show dismissible fade variant="danger" v-if="error">{{
        error
      }}</b-alert>
      <b-form class="justify-content-center" @submit.prevent="addRequest()">
        <b-form-datepicker
          class="mb-2 mr-sm-2 mb-sm-2"
          :min="min"
          :max="max"
          id="filter-input"
          v-model="date"
          locale="en"
          required
          placeholder="Choose a date:"
          data-toggle="tooltip"
          data-placement="top"
          title="Requests must be 14 days before.."
        ></b-form-datepicker>
        <b-form-timepicker
          required
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="timeFrom"
          locale="cs"
          placeholder="Start shift:"
        ></b-form-timepicker>
        <b-form-timepicker
          required
          class="mb-2 mr-sm-2 mb-sm-2"
          v-model="timeTo"
          locale="cs"
          placeholder="End shift:"
        ></b-form-timepicker>

        <!-- Real time error alert - checking right time -->
        <b-alert show dismissible fade variant="danger" v-if="timeFrom > timeTo"
          >Your shift must start earlier than ends. (Start &lt; End)</b-alert
        >

        <b-button block variant="dark" type="submit">Add</b-button>
        <b-button block variant="outline-dark" @click="back()">Back</b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";
export default {
  data() {
    //get actual date
    var minDate = new Date();
    var maxEditDate = new Date();
    maxEditDate.setDate(maxEditDate.getDate() + (7 - maxEditDate.getDay()) +7);
    //set minDate in calendar to monday two weeks in advance
    minDate.setDate(minDate.getDate() + (7 - minDate.getDay()) + 8);
    return {
      isBusy: false,
      requests: [],
      keyword: null,
      edit: false,
      add: false,
      sortBy: "date",
      sortDesc: true,
      id: "",
      date: "",
      timeFrom: "",
      timeTo: "",
      maxEditDate: maxEditDate,
      min: minDate,
      max: "",
      message: "",
      error: "",
      fields: [
        { key: "date", label: "Date (YYYY-MM-DD)", sortable: true },
        { key: "time_from", label: "Start shift (HH:mm)", sortable: true },
        { key: "time_to", label: "End shift (HH:mm)", sortable: true },
        { key: "action", label: "Action", sortable: true, tdClass: 'actionBar' },
      ],
    };
  },

  created() {
    //Load employee requests, if page is rendering
    this.loadRequests();
  },

  methods: {
    ...mapActions(["logout"]),
    //Funciton for add new request - only employee.
    addRequest() {
      if (!this.add) {
        this.add = true;
      } else {
        if (this.timeFrom && this.timeTo && this.date) {
          //checking minimal range of shift
          if (
            this.timeTo.substring(0, 2) * 60 +
              this.timeTo.substring(3, 5) * 1 -
              (this.timeFrom.substring(0, 2) * 60 +
                this.timeFrom.substring(3, 5) * 1) <
            60
          ) {
            this.error = "The shift must last at least 1 hour";
          } else {
            //condition for check start shift time < end shift time
            if (
              this.timeFrom.substring(0, 2) * 1 >
              this.timeTo.substring(0, 2) * 1
            ) {
              this.error =
                "You can do shifts only in one day, if you want do night shift, split shift into individual days.";
            } else {
              var newRequest = {
                time_from: this.timeFrom.substring(0, 5),
                time_to: this.timeTo.substring(0, 5),
                date: this.date,
              };
              axios
                .post(
                  process.env.VUE_APP_MAIN_PATH+"/api/shifts/newrequest/",
                  newRequest
                )
                .then((res) => {
                  this.message = res.data.msg;
                  this.$bvToast.show("my-toast");
                  this.timeFrom = "";
                  this.timeTo = "";
                  this.date = "";
                  this.error = "";
                  this.requests = [];
                  this.add = false;
                  this.loadRequests();
                })
                .catch((error) => {
                  this.error = error.response.data.msg;
                });
            }
          }
        } else {
          //this is because date and time picker dont have required in tag condition
          this.error = "You must fill all inputs!";
        }
      }
    },
    //Funciton for editing requests - only employee.
    editRequest(request) {
      //This condition set data from table to edit form, if edit == false
      if (!this.edit) {
        this.edit = true;
        this.date = request.date;
        this.id = request._id;
        this.timeFrom = request.time_from;
        this.timeTo = request.time_to;
      } else {
        if (this.timeFrom && this.timeTo) {
          //same as edit
          if (
            this.timeTo.substring(0, 2) * 60 +
              this.timeTo.substring(3, 5) * 1 -
              (this.timeFrom.substring(0, 2) * 60 +
                this.timeFrom.substring(3, 5) * 1) <
            60
          ) {
            this.error = "The shift must last at least 1 hour";
          } else {
            if (
              this.timeFrom.substring(0, 2) * 1 >
              this.timeTo.substring(0, 2) * 1
            ) {
              this.error =
                "You can do shifts only in one day, if you want do night shift, split shift into individual days.";
            } else {
              var updatedRequest = {
                time_from: this.timeFrom.substring(0, 5),
                time_to: this.timeTo.substring(0, 5),
              };
              axios
                .put(
                  process.env.VUE_APP_MAIN_PATH+"/api/shifts/update/" + this.id,
                  updatedRequest
                )
                .then((res) => {
                  this.message = res.data.msg;
                  this.items = [];
                  this.loadRequests();
                });
              this.$bvToast.show("my-toast");
              this.error = "";
              this.timeFrom = "";
              this.timeTo = "";
              this.date = "";
              this.requests = [];
              this.loadRequests();
              this.edit = false;
            }
          }
        } else {
          this.error = "You must fill all inputs!";
        }
      }
    },

    //Function for removing shift requests - only employee
    async remove(shift) {
      axios
        .delete(process.env.VUE_APP_MAIN_PATH+"/api/shifts/delete/" + shift._id)
        .then((res) => {
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
        });
      this.requests = [];
      this.loadRequests();
    },

    //Function for load data from server to table
    async loadRequests() {
      this.isBusy = true;
      this.requests = await axios.get(
        process.env.VUE_APP_MAIN_PATH+"/api/shifts/myrequests"
      );
      this.requests = this.requests.data;
      this.isBusy = false;
    },

    //This is function for back button in edit and add form
    back() {
      this.edit = false;
      this.add = false;
      this.timeFrom = "";
      this.timeTo = "";
      this.date = "";
      this.error = "";
    },
  },


  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapGetters(["isManager"]),

    //Function for filtering data from table on name, hours and holiday hours
    filterList() {
      return this.keyword
        ? this.requests.filter((item) => item.date.includes(this.keyword))
        : this.requests;
    },
  },
};
</script>

<style>

</style>