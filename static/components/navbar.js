export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #0d6efd; border: 2px solid orange;">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand fw-bold text-black">Quiz Master Application</router-link>

        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">

            <li class="nav-item" v-if="isAdmin">
              <router-link to="/admindashboard" class="nav-link text-black">Home</router-link>
            </li>
            <li class="nav-item" v-if="!isAdmin">
              <router-link to="/dashboard" class="nav-link text-black">Home</router-link>
            </li>


            <li class="nav-item" v-if="isAdmin">
              <router-link to="/adminquiz" class="nav-link text-black">Quiz</router-link>
            </li>
            <li class="nav-item" v-if="!isAdmin">
              <router-link to="/user/scores" class="nav-link text-black">Scores</router-link>
            </li>

            <li class="nav-item">
              <router-link to="/summary" class="nav-link text-black">Summary</router-link>
            </li>

            <li class="nav-item">
              <router-link to="/search" class="nav-link text-black">Search</router-link>
            </li>
          </ul>

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
      isAdmin: false
    };
  },

  mounted() {
    this.checkUserRole(); // done so that two different navbars are created for user and admin
  },

  methods: {
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
    }
  }
};
