<template>
  <div id="mngshifts">
    <!--Button for edit shift requests-->
    <b-button
      variant="warning"
      v-if="edit !== true && !editWeek && showBtn"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="showNextShift()"
      >Show next shift</b-button
    >
    <!--Back to all requests-->
    <b-button
      variant="warning"
      v-if="edit !== true && editWeek"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="allShifts()"
      >Show all shifts</b-button
    >
    <br />
    <!--Previous day button-->
    <b-button
      variant="primary"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      v-if="edit !== true && editWeek"
      @click="previousDay()"
      >Previous day</b-button
    >
    <!--Next day button-->
    <b-button
      variant="primary"
      v-if="edit !== true && editWeek"
      class="mb-2 mr-sm-2 mb-sm-2 mngbtn"
      @click="nextDay()"
      >Next day</b-button
    >

    <!-- Search ipnut for filtering data from table - date picker-->
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
          @click="
            keyword = '';
            editWeek = '';
          "
          >Clear</b-button
        >
      </b-input-group-append>
    </b-input-group>
    <b-card
      bg-variant="dark"
      text-variant="white"
      style="text-align: center; margin-bottom: 1%"
      title="Monthly time worked"
    >
      <b-card-text> You have worked this month {{ time }}. </b-card-text>
    </b-card>
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
        <template v-slot:cell(length)="data">
          <b>{{ data.item.length }}</b>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
export default {
  data() {
    var editTime = new Date();
    editTime.setHours(1, 0, 0, 0);
    return {
      isBusy: false,
      editWeek: false,
      showBtn: false,
      requests: [],
      keyword: null,
      edit: false,
      add: false,
      sortBy: "date",
      sortDesc: true,
      id: "",
      date: "",
      time: 0,
      editTime: editTime,
      timeFrom: "",
      timeTo: "",
      message: "",
      error: "",
      fields: [
        { key: "date", label: "Date (YYYY-MM-DD)", sortable: true },
        { key: "shift_time", label: "Shift", sortable: true },
        { key: "length", label: "Shift length", sortable: true },
        { key: "completed", label: "Completed", sortable: true },
      ],
      items: [],
    };
  },

  created() {
    //Load employee requests, if page is rendering
    this.loadConfirmed();
  },

  methods: {
    //Function for load data from server to table
    async loadConfirmed() {
      this.isBusy = true;
      this.requests = await axios.get(
        process.env.VUE_APP_MAIN_PATH + "/api/shifts/myshifts"
      );
      for (var i = 0; i < this.requests.data.length; i++) {
        let item = {
          _id: this.requests.data[i]._id,
          date: this.requests.data[i].date,
          shift_time:
            this.requests.data[i].time_from +
            " - " +
            this.requests.data[i].time_to,
          length: this.requests.data[i].length,
          completed:
            this.editTime.getTime() >
            new Date(this.requests.data[i].date).getTime()
              ? "Completed!"
              : this.editTime.getTime() ==
                new Date(this.requests.data[i].date).getTime()
              ? "Today shift!"
              : "Next shift!",
        };
        this.items.push(item);
      }
      this.getWorkedHours();
      this.showBtn = this.items.find(
        ({ completed }) => completed === "Next shift!"
      )
        ? true
        : false;
      this.isBusy = false;
    },

    //This function show next shift
    showNextShift() {
      this.editWeek = true;
      var n = -1;
      var res = null;
      while (
        ++n < this.items.length &&
        new Date(this.items[n].date) < new Date()
      );
      res =
        this.items[n].date ||
        new Date().getFullYear() +
          "-" +
          ("0" + (new Date().getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + new Date().getDate()).slice(-2);
      this.keyword = res;
    },

    //Function for get next day
    nextDay() {
      var filterDate = new Date(this.keyword);
      filterDate.setDate(filterDate.getDate() + 1);
      this.keyword =
        filterDate.getFullYear() +
        "-" +
        ("0" + (filterDate.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + filterDate.getDate()).slice(-2);
    },

    //Function for get previous day
    previousDay() {
      var filterDate = new Date(this.keyword);
      filterDate.setDate(filterDate.getDate() - 1);
      this.keyword =
        filterDate.getFullYear() +
        "-" +
        ("0" + (filterDate.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + filterDate.getDate()).slice(-2);
    },

    //for "Show all shifts" button, show all requests
    allShifts() {
      this.keyword = "";
      this.editWeek = false;
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

    //This is function for getting users worked hours
    getWorkedHours() {
      for (var i = 0; i < this.items.length; i++) {
        if (
          this.items[i].completed == "Completed!" &&
          new Date(this.items[i].date).getMonth() == new Date().getMonth()
        ) {
          this.time +=
            this.items[i].length.substring(0, 2) * 60 +
            this.items[i].length.substring(3, 5) * 1;
        }
      }
      this.time = this.time / 60 + " hours";
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