export default {
    template: `
      <div>
        <!-- Top Navbar -->
        <nav class="navbar navbar-light bg-white px-4 fixed-top shadow-sm">
          <span class="navbar-brand fw-bold">Quiz Master</span>
          <router-link to="/login" class="btn btn-link">Login</router-link>
        </nav>
  
        <!-- Carousel -->
        <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel" style="height: 100vh; margin-top: 56px;">
          <div class="carousel-inner h-100">
            <div class="carousel-item active h-100">
              <img src="/static/assets/img1.jpeg" class="d-block w-100 h-100" style="object-fit: cover;" alt="Quiz Slide 1">
              <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-75 p-3 rounded">
                <h5 class="fw-bold">Challenge Yourself</h5>
                <p>Answer exciting questions and test your knowledge</p>
              </div>
            </div>
            <div class="carousel-item h-100">
              <img src="/static/assets/image2.jpg" class="d-block w-100 h-100" style="object-fit: cover;" alt="Quiz Slide 2">
              <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-75 p-3 rounded">
                <h5 class="fw-bold">Track Your Progress</h5>
                <p>Get detailed performance insights after each quiz</p>
              </div>
            </div>
            <div class="carousel-item h-100">
              <img src="/static/assets/image3.jpg" class="d-block w-100 h-100" style="object-fit: cover;" alt="Quiz Slide 3">
              <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-75 p-3 rounded">
                <h5 class="fw-bold">Learn & Improve</h5>
                <p>Review your answers and enhance your preparation</p>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>
  
        <!-- Login Card Overlay -->
        <!-- Login Card Overlay -->
        <div class="position-absolute top-50 start-50 translate-middle" style="width: 400px;">

          <div class="card shadow">
            <div class="card-body">
              <h3 class="text-center mb-3">Login</h3>
  
              <!-- this is email field -->
              <label for="email">Enter your email:</label>
              <input type="text" id="email" v-model="formData.email" class="form-control mb-3">
  
              <!-- this is password field -->
              <label for="pass">Enter your password:</label>
              <input type="password" id="pass" v-model="formData.password" class="form-control mb-4">
  
              <div class="d-grid mb-2">
                <button class="btn btn-primary" @click="loginUser">Login</button> 
              </div>
  
              <!-- displays error message -->
              <p v-if="message" class="text-center text-danger mt-2">{{ message }}</p>
  
              <!-- register link -->
              <p class="text-center mt-3 mb-0">Don't have an account?</p>
              <div class="d-grid">
                <router-link to="/register" class="btn btn-outline-success mt-1">Register</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data: function () {
      return {
        formData: {  // object
          email: "",
          password: ""
        },
        message: "" // for error messages from backend
      };
    },
  
    methods: {
      loginUser: function () {
        fetch('/api/login', {  // /api/login is the backend route in routes.py
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.formData) // 
        })
        .then(response => response.json().then(data => {  // this fetch returns a promise whatever it returns is a 'response' and the first then again returns a promise whatever it returns is a 'data'
          // status code=200
          if (response.ok) {
            // the authentication token is stored in local storage after successful login
            localStorage.setItem("auth_token", data["auth-token"]); // first parameter is the key in localstorage || second parameter is the value
            localStorage.setItem("id", data.id);
            localStorage.setItem("username", data.username);
            if (data.roles.includes('admin')){
              this.$router.push('/admindashboard') // redirects to admin dashboard
            }
            else {
              this.$router.push('/dashboard');  // redirects to dashboard component
               }
            
          } 
          else {
            // status code=400,404
            this.message = data.message;  // display message from backend
          }
        }))
        // it runs only when there is a network error 
        .catch(error => {
          console.error("Error logging in:", error);
          this.message = "Server error. Please try again later.";
        });
      }
    }
  };
  