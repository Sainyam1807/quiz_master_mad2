export default {
  template: `
    <div>
      <h2> Welcome, {{ userData.username }}! </h2>

      <!-- Display message from backend -->
      <div v-if="message" class="alert alert-info text-center mt-3" role="alert">
       {{ message }}
      </div>

      <!-- ADDED Manage User and New Subject section in same line -->
      <div v-if="isAdmin" class="text-center my-4 d-flex justify-content-center gap-3">
        <button @click="showCreateSubjectForm = true" class="btn btn-success">
           Create New Subject
        </button>
        <router-link to="/manageusers" class="btn btn-primary">
          Manage Users
        </router-link>
      </div>

      <!-- Create New Subject Form -->
      <div v-if="showCreateSubjectForm" class="card mx-auto mb-4 p-4 shadow" style="width: 30rem;">
        <h4 class="mb-3">Create New Subject</h4>
        <input v-model="newSubject.name" class="form-control mb-2" placeholder="Enter Subject Name">
        <input v-model="newSubject.category" class="form-control mb-2" placeholder="Enter Category">
        <textarea v-model="newSubject.description" class="form-control mb-2" placeholder="Enter Description"></textarea>
        <button @click="createSubject" class="btn btn-primary mt-2">Submit</button>
        <button @click="showCreateSubjectForm = false" class="btn btn-secondary mt-2 ml-2">Cancel</button>
      </div>

      <!-- Edit Subject Form -->
      <div v-if="showEditSubjectForm" class="card mx-auto mb-4 p-4 shadow" style="width: 30rem;">
        <h4 class="mb-3">Edit Subject</h4>
        <input v-model="editSubjectData.name" class="form-control mb-2" placeholder="Enter Subject Name">
        <input v-model="editSubjectData.category" class="form-control mb-2" placeholder="Enter Category">
        <textarea v-model="editSubjectData.description" class="form-control mb-2" placeholder="Enter Description"></textarea>
        <button @click="updateSubject" class="btn btn-success mt-2">Save Changes</button>
        <button @click="showEditSubjectForm = false" class="btn btn-secondary mt-2 ml-2">Cancel</button>
      </div>

      <!-- Display all subjects in card format -->
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

              <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center px-3">
                <!-- Edit and Delete Buttons visible only to Admin -->
                <div v-if="isAdmin">
                  <button @click="editSubject(subject)" class="btn btn-warning btn-sm m-1"> Edit</button>
                  <button @click="deleteSubject(subject.id)" class="btn btn-danger btn-sm m-1"> Delete</button>
                </div>

                <router-link 
                  :to="'/adminchapters/' + subject.id" 
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
      userData: {
          // email: "",
          // username: "",
          // dob: "",
          // qualification: "" 
      },  // object
      subjects: null, // this will be list of subject objects returned from backend
      showCreateSubjectForm: false, // controls visibility of create form
      showEditSubjectForm: false, // controls visibility of edit form
      message:"",
      newSubject: { // model for new subject
        name: '',
        description: '',
        category: ''
      },
      editSubjectData: { // model for editing subject
        id: null, // currently it is null but it stores id when everything is copied from current subject to this editSubjectData by ...subject
        name: '',
        description: '',
        category: ''
      }
    };
  },

  mounted() {  // this part gets automatically triggered when dashboard is loaded  || automatically called once when component is first loaded
    
    // loads user information to display username
    this.loadUser();

    // now fetch subjects
    this.fetchSubjects(); // present in methods section
  },

  computed: {
    // checking if current user is admin || it is important to check this in frontend even though it is checked in backend
    isAdmin() {
      return this.userData.roles && this.userData.roles.includes('admin'); 
    }
  },
  
  // manually called whenever needed
  methods: {  

    // fetch user data
    loadUser() {
      fetch('/api/home', {   // /api/home in routes.py
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "authentication-token": localStorage.getItem("auth_token") // first part is the authentication-token provided in config.py || second one is retrieved by key 'auth_token' in local storage
        }
      })
      .then(response => response.json())
      .then(data => { 
        this.userData = data;  // store all user data like username, email, dob, qualification, roles
    
        // check if not admin
        if (!this.isAdmin) { 
          this.message = "You are not authorized to view Admin Dashboard.";  // gives error message if normal user tries to access admin dashboard by typing /admindashboard
          // this.$router.push('/dashboard');
        }
      })
      .catch(error => {
        console.error("Error loading user data:", error);
      });
    },

    // fetching subjects after updating/deleting subjects || RELOAD automatically
    fetchSubjects() {
      fetch('/api/subjects/get', {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "authentication-token": localStorage.getItem("auth_token") // token-based authentication
        }
      })
      .then(response => response.json())
      .then(data => this.subjects = data)
      .catch(error => {
        console.error("Error fetching subjects:", error);
      });
    },

    // Create New Subject
    createSubject() {
      fetch('/api/subjects/create', {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json',
          "authentication-token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.newSubject)  // converts into one JSON body
      })
      .then(response => response.json()) //  get JSON body containing 'message'
      .then(data => {
        this.message = data.message; // sets the message from backend
        if (data.message === "Subject created successfully!") {
          this.showCreateSubjectForm = false;
          this.newSubject = { name: '', description: '', category: '' };
          this.fetchSubjects();
        }
      })
      .catch(error => console.error('Error creating subject:', error));
    },

    // Delete Subject
    deleteSubject(subjectId) {
      if (confirm('Are you sure you want to delete this subject?')) {
        fetch(`/api/subjects/delete/${subjectId}`, {
          method: 'DELETE',
          headers: {
            "Content-Type": 'application/json',
            "authentication-token": localStorage.getItem("auth_token")
          }
        })
        .then(response => response.json())
        .then(data => {
          this.message = data.message;
          if (data.message === "Subject deleted successfully!") {
            this.fetchSubjects();
          }
        })
        .catch(error => console.error('Error deleting subject:', error));
      }
    },
    

    // so that when i click on edit it automatically fills all the values currently present 
    editSubject(subject) {  // subject is the selected subject object 
      this.editSubjectData = { ...subject }; // this copies everything from that subject to editSubjectData
      this.showEditSubjectForm = true;
    },

    // Update Subject
    updateSubject() {
      fetch(`/api/subjects/update/${this.editSubjectData.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": 'application/json',
          "authentication-token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.editSubjectData)
      })
      .then(response => response.json())
      .then(data => {
        this.message = data.message;
        if (data.message === "Subject updated successfully!") {
          this.showEditSubjectForm = false;
          this.fetchSubjects();
        }
      })
      .catch(error => console.error('Error updating subject:', error));
    },
  }
};
