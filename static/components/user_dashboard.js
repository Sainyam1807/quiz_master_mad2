export default {
    template: `
      <div>
        <h2> Welcome, {{ userData.username }}! </h2>
  
        <!-- Display message from backend -->
        <div v-if="message" class="alert alert-info text-center mt-3" role="alert">
          {{ message }}
        </div>
  
        <!-- Display all subjects -->
        <div class="container mt-5">
          <h3 class="mb-4 text-center">Subjects Available</h3>
          <div class="row row-cols-1 row-cols-md-3 g-4">
            <div class="col" v-for="subject in subjects" :key="subject.id">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title"><strong>{{ subject.name }}</strong></h5>
                  <p class="card-text"><strong>Category:</strong> {{ subject.category }}</p>
                  <p class="card-text"><strong>Description:</strong> {{ subject.description }}</p>
                </div>
                <div class="card-footer bg-transparent border-0 text-center">
                  <!-- only View Chapters option for users -->
                  <router-link 
                    :to="'/chapters/' + subject.id" 
                    class="btn btn-primary m-1">
                    View Chapters
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
  
      </div>  
    `,
    
    data: function () {
      return {
        userData: {},  // stores logged in user information
        subjects: null, // list of subjects
        message: "" // for displaying messages
      };
    },
  
    mounted() {  // automatically called when page loads
      this.loadUser();
      this.fetchSubjects();
    },
  
    methods: {
  
      // fetch logged-in user data
      loadUser() {
        fetch('/api/home', {   
          method: 'GET',
          headers: {
            "Content-Type": 'application/json',
            "authentication-token": localStorage.getItem("auth_token")
          }
        })
        .then(response => response.json())
        .then(data => {
          this.userData = data;
        })
        .catch(error => {
          console.error("Error loading user data:", error);
        });
      },
  
      // fetch subjects from backend
      fetchSubjects() {
        fetch('/api/subjects/get', {
          method: 'GET',
          headers: {
            "Content-Type": 'application/json',
            "authentication-token": localStorage.getItem("auth_token")
          }
        })
        .then(response => response.json())
        .then(data => this.subjects = data)
        .catch(error => {
          console.error("Error fetching subjects:", error);
        });
      }
    }
  };
  