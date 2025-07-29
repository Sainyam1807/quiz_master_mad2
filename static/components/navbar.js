export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #0d6efd; border: 2px solid orange;">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand fw-bold text-black">Quiz Master Application</router-link>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <!-- admin navbar -->
            <li class="nav-item" v-if="isAdmin">
              <router-link to="/admindashboard" class="nav-link text-black">Home</router-link>
            </li>
            <!-- user navbar -->
            <li class="nav-item" v-if="!isAdmin">
              <router-link to="/dashboard" class="nav-link text-black">Home</router-link>
            </li>

            <!-- quiz tab for admin -->
            <li class="nav-item" v-if="isAdmin">
              <router-link to="/adminquiz" class="nav-link text-black">Quiz</router-link>
            </li>
            <!-- scores tab for user -->
            <li class="nav-item" v-if="!isAdmin">
              <router-link to="/user/scores" class="nav-link text-black">Scores</router-link>
            </li>

            <!-- summary visible to all -->
            <li class="nav-item" v-if="isAdmin">
              <router-link to="/admin/summary" class="nav-link text-black">Summary</router-link>
            </li>
            <li class="nav-item" v-else>
              <router-link to="/user/summary" class="nav-link text-black">Summary</router-link>
            </li>

            <!-- Search dropdown visible to both admin and user -->
            <li class="nav-item dropdown" v-if="isAdmin || !isAdmin">
              <a class="nav-link dropdown-toggle text-black" href="#" id="searchDropdown" role="button" data-bs-toggle="dropdown">
                Search
              </a>
              <ul class="dropdown-menu p-3" aria-labelledby="searchDropdown" style="min-width: 300px;">
                <li class="mb-2">
                  <label for="searchType" class="form-label fw-bold">Search By</label>
                  <select class="form-select" id="searchType" v-model="searchType">
                    <option v-if="isAdmin" value="user">User</option>
                    <option value="subject">Subject</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </li>
                <li class="mb-2">
                  <input type="text" class="form-control" v-model="searchQuery" :placeholder="'Enter ' + searchType + ' name'" />
                </li>
                <li>
                  <button class="btn btn-primary w-100" @click="searchUser">Search</button>
                </li>
              </ul>
            </li>

          </ul>

          <!-- profile and logout -->
          <div class="d-flex">
            <router-link to="/profile" class="nav-link text-black me-2">Profile</router-link>
            <a href="/logout" class="nav-link text-black">Logout</a>
          </div>
        </div>
      </div>
    </nav>
  `,

  data() {
    return {
      isAdmin: false,     // check user role
      searchQuery: "",    // search input
      searchType: "subject" // default search type
    };
  },

  mounted() {
    this.checkUserRole(); // done so that two different navbars are created for user and admin
  },

  methods: {
    // determine if user is admin
    checkUserRole() {
      fetch('/api/home', {
        headers: {
          'Content-Type': 'application/json',
          'authentication-token': localStorage.getItem('auth_token')
        }
      })
      .then(res => res.json())
      .then(data => {
        this.isAdmin = data.roles.includes("admin"); // checks
      })
      .catch(() => {
        this.isAdmin = false;
      });
    },

    // redirect to search results page
    searchUser() {
      if (this.searchQuery.trim() === "") return;
      this.$router.push({
        path: "/searchresults",
        query: {
          query: this.searchQuery.trim(),
          type: this.searchType
        }
      });
    }
  }
};
