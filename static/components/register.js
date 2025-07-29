
// v-model::  The value of the input box in a form is connected to formData.email. Whenever someone types in the box, Vue updates formData.email automatically.
//            Whenever updates formData.email in code, the input field value updates automatically too

export default {
  template: `
    <div class="row border">
      <div class="col" style="height: 750px;">
        <div class="border mx-auto mt-5 shadow rounded bg-white" style="height: 680px; width: 450px;"> <!-- Increased height and width -->
          <div>
            <h2 class="text-center mt-4">Register Form</h2>
            <div class="p-4">
              <label for="email">Enter your email:</label>
              <input type="text" id="email" v-model="formData.email" class="form-control mb-3">

              <label for="username">Enter your username:</label>
              <input type="text" id="username" v-model="formData.username" class="form-control mb-3">

              <label for="password">Enter your password:</label>
              <input type="password" id="password" v-model="formData.password" class="form-control mb-3">

              <label for="dob">Enter your Date of Birth:</label>
              <input type="date" id="dob" v-model="formData.dob" class="form-control mb-3">

              <label for="qualification">Enter your Qualification:</label>
              <input type="text" id="qualification" v-model="formData.qualification" class="form-control mb-4">

              <div class="d-grid mb-3">
                <button class="btn btn-success" @click="registerUser">Register</button> 
              </div>

              <div v-if="message" class="text-center text-danger mb-3">
                {{ message }}
              </div>

              <div class="text-center">
                Already a user?
                <router-link to="/login" class="btn btn-outline-primary btn-sm ms-2">Login</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data: function () {
    return {
      formData: {
        email: "",
        username: "",
        password: "",
        dob: "",
        qualification: ""
      },
      message: "" 
    };
  },
  methods: {
    registerUser: function () {
      fetch('/api/register', {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify(this.formData) 
      })
        .then(response => {
          return response.json().then(data => {
            if (response.ok) {
              this.$router.push('/login');   // this.$router refers to the Vue Router instance inside the Vue component and push('/login') programmatically navigates to the /login page.
            } else {
              this.message = data.message; 
            }
          });
        })

        // only when there is a network error
        .catch(error => {
          console.error("Error during registration:", error);
          this.message = "Something went wrong. Please try again."; 
        });
    }
  }
};
