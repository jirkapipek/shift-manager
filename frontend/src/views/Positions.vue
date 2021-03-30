<template>
  <div id="positions">
    <!--Button for adding new position-->
    <b-button
      variant="success"
      v-if="edit !== true && add !== true && isAdmin"
      class="mb-2 mr-sm-2 mb-sm-2"
      @click="addNewPosition()"
      >Add new position</b-button
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
        placeholder="Search by name, description and salary"
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
        :items="positions"
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

        <!-- Custom table cell for toast with employees with position -->
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
          <b-button block variant="dark" @click="editPosition(data.item)"
            >Edit</b-button
          ><b-button block variant="danger" @click="remove(data.item)"
            >Delete</b-button
          >
        </template>
      </b-table>
    </div>
    <!-- Edit form for position -->
    <div class="edit" v-if="edit == true">
      <h2>Edit position</h2>
      <b-form
        class="justify-content-center"
        @submit.prevent="editPosition(null)"
      >
        <b-input
          required
          v-model="name"
          placeholder="Name of position"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-input
          required
          v-model="defaultSalary"
          placeholder="Default salary (hourly or fixed wage)"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-form-textarea
          required
          v-model="description"
          placeholder="Enter description of position..."
          rows="3"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-form-textarea>
        <b-button block variant="dark" type="submit">Edit</b-button>
        <b-button block variant="outline-dark" @click="back()">Back</b-button>
      </b-form>
    </div>

    <!-- Adding form for position -->
    <div class="edit" v-if="add == true">
      <h2>Add new position</h2>
      <b-form class="justify-content-center" @submit.prevent="addNewPosition()">
        <b-input
          required
          v-model="name"
          placeholder="Name of position"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-input
          required
          v-model="defaultSalary"
          placeholder="Default salary (hourly or fixed wage)"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-input>
        <b-form-textarea
          required
          v-model="description"
          placeholder="Enter description of position..."
          rows="3"
          class="mb-2 mr-sm-2 mb-sm-2"
        ></b-form-textarea>
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
      isBusy: false,
      positions: [],
      keyword: null,
      edit: false,
      add: false,
      id: "",
      name: "",
      description: "",
      defaultSalary: "",
      message: "",
      fields: [
        { key: "name", label: "Name", sortable: true },
        { key: "description", label: "Position specification", sortable: true },
        { key: "default_salary", label: "Default salary", sortable: true },
        { key: "show_employees", label: "Employees", tdClass: "actionBar" },
      ],
    };
  },

  created() {
    //Load positions, if page is rendering
    this.loadPositions();
  },

  methods: {
    //Funciton for add new position - only admin (Send request to server).
    addNewPosition() {
      if (!this.add) {
        this.add = true;
      } else {
        var newPosition = {
          name: this.name,
          description: this.description,
          default_salary: this.defaultSalary,
        };
        axios.post(process.env.VUE_APP_MAIN_PATH +"/api/jobpositions/new/", newPosition).then((res) => {
          this.message = res.data.msg;
        });
        (this.name = ""),
          (this.description = ""),
          (this.defaultSalary = ""),
          this.$bvToast.show("my-toast");
        this.positions = [];
        this.add = false;
        this.loadPositions();
      }
    },
    //Funciton for editing position - only admin (Send request to server).
    editPosition(position) {
      //This condition set data from table to edit form, if edit == false
      if (!this.edit) {
        this.edit = true;
        this.id = position._id;
        this.name = position.name;
        this.description = position.description;
        this.defaultSalary = position.default_salary;
      } else {
        var updatedPosition = {
          name: this.name,
          description: this.description,
          default_salary: this.defaultSalary,
        };

        axios
          .put(
            process.env.VUE_APP_MAIN_PATH +
              "/api/jobpositions/update/" +
              this.id,
            updatedPosition
          )
          .then((res) => {
            this.name = "";
            this.description = "";
            this.defaultSalary = "";
            this.message = res.data.msg;
            this.$bvToast.show("my-toast");
            this.positions = [];
            this.edit = false;
            //this.loadPositions();
          });
      }
    },

    //Function for removing position - only admin (Send request to server)
    async remove(position) {
      axios
        .delete(
          process.env.VUE_APP_MAIN_PATH +
            "/api/jobpositions/delete/" +
            position._id
        )
        .then((res) => {
          this.message = res.data.msg;
          this.$bvToast.show("my-toast");
          this.positions = [];
          this.loadPositions();
        });
    },

    //Function for load data from server to table
    async loadPositions() {
      this.isBusy = true;
      this.positions = await axios.get(
        process.env.VUE_APP_MAIN_PATH + "/api/jobpositions/all"
      );
      this.positions = this.positions.data;
      this.isBusy = false;
    },

    //This is function for back button in edit and add form
    back() {
      this.edit = false;
      this.add = false;
      this.name = "";
      this.description = "";
      this.defaultSalary = "";
    },
  },

  async mounted() {
    //add action bar for admin
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
        ? this.positions.filter(
            (item) =>
              item.name.includes(this.keyword) ||
              item.description.includes(this.keyword) ||
              item.defaultSalary.includes(this.keyword)
          )
        : this.positions;
    },
  },
};
</script>

<style>
</style>