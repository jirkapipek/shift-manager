<template>
  <div id="mngrequests">
    <!--Button for edit shift requests-->
    <b-button
      variant="warning"
      v-if="edit !== true && !editWeek"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="showNextWeek()"
      >Edit shifts for the next week</b-button
    >

    <!--Back to all requests-->
    <b-button
      variant="warning"
      v-if="edit !== true && editWeek"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="allShifts()"
      >Show all requests</b-button
    >
    <!--Help button for manager and admin-->
    <b-button
      variant="outline-dark"
      v-if="edit !== true"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="$bvToast.show('help-toast')"
      >Help</b-button
    >
    <br>
    <!--Previous day button-->
    <b-button
      variant="primary"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      v-if="
        edit !== true &&
        editWeek &&
        new Date(keyword).getTime() !== new Date(min).getTime()
      "
      @click="previousDay()"
      >Previous day</b-button
    >
    <!--Next day button-->
    <b-button
      variant="primary"
      v-if="
        edit !== true &&
        editWeek &&
        new Date(keyword).getTime() !== new Date(max).getTime()
      "
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="nextDay()"
      >Next day</b-button
    >
    <!--Help toast info-->
    <b-toast
      id="help-toast"
      title="Shift helper"
      style="float-right"
      static
      no-auto-hide
    >
      <p>
        If you want confirm shifts for the next week, click button
        <b>Edit shift for the next week</b>. Shift requests are displayed for
        each day (<b>Next day</b> and <b>Previus day</b> buttons). W\hen you
        edit shifts for a given day, you must save them using the button
        <b>Save the day</b>
      </p>
    </b-toast>
  <!--Save the edited day button-->
    <b-button
      variant="success"
      class="mb-2 mr-sm-2 mb-sm-2 float-right"
      @click="updateAll()"
      v-if="editWeek && edit !== true"
      >Save the day</b-button
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

    <!-- Search ipnut for filtering data from table - date picker-->
    <b-input-group v-if="edit !== true && add !== true">
      <b-form-datepicker
        class="mb-2 mr-sm-2 mb-sm-2"
        id="filter-input"
        v-model="keyword"
        :min="min"
        :max="max"
        locale="en"
        placeholder="Choose a date for filter shifts"
      ></b-form-datepicker>
      <b-input-group-append>
        <b-button
          class="mb-2 mr-sm-2 mb-sm-2"
          :disabled="!keyword"
          @click="
            keyword = '';
            editWeek = '';
          "
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
          <b-button
            v-if="editWeek"
            block
            variant="dark"
            @click="editRequest(data.item)"
            >Edit</b-button
          ><b-button
            v-if="editWeek"
            block
            variant="danger"
            @click="remove(data.item)"
            >Delete</b-button
          >
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
      <b-form class="justify-content-center" @submit.prevent="editRequest()">
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
        <b-button block variant="success" type="submit">Confirm</b-button>
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
    //get actual date
    var minDate = new Date();
    var maxDate = new Date();
    //set minDate and maxDax in calendar for edit requests
    minDate.setDate(minDate.getDate() + (7 - minDate.getDay()) + 1);
    maxDate.setDate(maxDate.getDate() + (7 - maxDate.getDay()) + 7);
    return {
      isBusy: false,
      editWeek: false,
      requests: [],
      keyword: null,
      edit: false,
      add: false,
      sortBy: "date",
      sortDesc: false,
      id: "",
      date: "",
      timeFrom: "",
      timeTo: "",
      min:
        minDate.getFullYear() +
        "-" +
        ("0" + (minDate.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + minDate.getDate()).slice(-2),
      max:
        maxDate.getFullYear() +
        "-" +
        ("0" + (maxDate.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + maxDate.getDate()).slice(-2),
      message: "",
      error: "",
      fields: [
        { key: "fullname", label: "Full Name", sortable: true },
        { key: "position", label: "Employee position", sortable: true },
        { key: "date", label: "Date (YYYY-MM-DD)", sortable: true },
        { key: "time_from", label: "Start shift (HH:mm)", sortable: true },
        { key: "time_to", label: "End shift (HH:mm)", sortable: true },
      ],
      items: [],
    };
  },

  created() {
    //Load employee requests, if page is rendering
    this.loadRequests();
  },

  methods: {
    editRequest(request) {
      //This condition set data from table to edit form, if edit == false
      if (!this.edit) {
        this.edit = true;
        this.date = request.date;
        this.id = request._id;
        this.timeFrom = request.time_from;
        this.timeTo = request.time_to;
      } else {
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
                this.$bvToast.show("my-toast");
              });
            this.error = "";
            this.timeFrom = "";
            this.timeTo = "";
            this.date = "";
            this.items = [];
            this.loadRequests();
            this.edit = false;
          }
        }
      }
    },
    //Function for save all days in the day.. (Confirm shifts)
    updateAll() {
      for (var i = 0; i < this.requests.length; i++) {
        if (
          new Date(this.requests[i].date).getTime() ===
          new Date(this.keyword).getTime()
        ) {
          this.confirmRequests(this.requests[i]);
        }
      }
      this.message = "Shifts for the day has been confirmed!";
      this.$bvToast.show("my-toast");

      this.items = [];
      this.loadRequests();
    },

    //Confirm shifts and save to DB.
    confirmRequests(request) {
      var updatedRequest = {
        time_from: request.time_from.substring(0, 5),
        time_to: request.time_to.substring(0, 5),
        request: false,
      };
      axios
        .put(
          process.env.VUE_APP_MAIN_PATH+"/api/shifts/update/" + request._id,
          updatedRequest
        )
        .then(() => {});
      this.error = "";
      this.timeFrom = "";
      this.timeTo = "";
      this.date = "";
    },

    //Function for removing shift requests
    async remove(shift) {
      axios
        .delete(process.env.VUE_APP_MAIN_PATH+"/api/shifts/delete/" + shift._id)
        .then((res) => {
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
        });
      this.items = [];
      this.loadRequests();
    },

    //Function for load data from server to table
    async loadRequests() {
      this.isBusy = true;
      this.requests = await axios.get(
        process.env.VUE_APP_MAIN_PATH+"/api/shifts/requests"
      );
      for (var i = 0; i < this.requests.data.length; i++) {
        let item = {
          _id: this.requests.data[i]._id,
          fullname:
            this.requests.data[i].owner.name +
            " " +
            this.requests.data[i].owner.lastname +
            " - " +
            this.requests.data[i].owner.email,
          position: this.requests.data[i].owner.position.name,
          date: this.requests.data[i].date,
          time_from: this.requests.data[i].time_from,
          time_to: this.requests.data[i].time_to,
        };
        this.items.push(item);
      }
      this.requests = this.requests.data;
      this.isBusy = false;
    },

    //set filter data to date picker and show week
    showNextWeek() {
      this.editWeek = true;
      this.fields.push({ key: "action", label: "Action", sortable: true, tdClass: 'actionBar' });
      var filterDate = new Date();
      //set minDate in calendar to monday two weeks in advance
      filterDate.setDate(filterDate.getDate() + (7 - filterDate.getDay()) + 1);
      this.keyword =
        filterDate.getFullYear() +
        "-" +
        ("0" + (filterDate.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + filterDate.getDate()).slice(-2);
    },
    //Function for get next day
    nextDay() {
      var filterDate = new Date(this.keyword);
      if (filterDate.getTime() < new Date(this.max).getTime()) {
        filterDate.setDate(filterDate.getDate() + 1);
        this.keyword =
          filterDate.getFullYear() +
          "-" +
          ("0" + (filterDate.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + filterDate.getDate()).slice(-2);
      }
    },

    //Function for get previous day
    previousDay() {
      var filterDate = new Date(this.keyword);
      if (filterDate.getTime() > new Date(this.min).getTime()) {
        filterDate.setDate(filterDate.getDate() - 1);
        this.keyword =
          filterDate.getFullYear() +
          "-" +
          ("0" + (filterDate.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + filterDate.getDate()).slice(-2);
      }
    },

    //for "Show all shifts" button, show all requests
    allShifts() {
      this.keyword = "";
      this.editWeek = false;
      this.fields = [
        { key: "fullname", label: "Full Name", sortable: true },
        { key: "position", label: "Employee position", sortable: true },
        { key: "date", label: "Date (YYYY-MM-DD)", sortable: true },
        { key: "time_from", label: "Start shift (HH:mm)", sortable: true },
        { key: "time_to", label: "End shift (HH:mm)", sortable: true },
      ];
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