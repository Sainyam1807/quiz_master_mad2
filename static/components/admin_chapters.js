export default {
  template: `
    <div class="container mt-5">
      <h2> Welcome, {{ userData.username }}! </h2>
      <h2 class="text-center mb-4">Manage Chapters</h2>

      <!-- Message Display -->
      <div v-if="message" class="alert alert-info text-center">{{ message }}</div>

      <!-- Create Chapter Button -->
      <div class="text-center mb-4">
        <button class="btn btn-success" @click="showCreateForm = true">
           Create New Chapter
        </button>
      </div>

      <!-- Create Chapter Form -->
      <div v-if="showCreateForm" class="card mx-auto p-4 shadow mb-4" style="width: 30rem;">
        <h4 class="mb-3">Create Chapter</h4>
        <input v-model="newChapter.name" class="form-control mb-2" placeholder="Chapter Name">
        <textarea v-model="newChapter.description" class="form-control mb-2" placeholder="Description"></textarea>
        <button class="btn btn-primary mt-2" @click="createChapter">Submit</button>
        <button class="btn btn-secondary mt-2 ms-2" @click="showCreateForm = false">Cancel</button>
      </div>

      <!-- Edit Chapter Form -->
      <div v-if="showEditForm" class="card mx-auto p-4 shadow mb-4" style="width: 30rem;">
        <h4 class="mb-3">Edit Chapter</h4>
        <input v-model="editChapter.name" class="form-control mb-2" placeholder="Chapter Name">
        <textarea v-model="editChapter.description" class="form-control mb-2" placeholder="Description"></textarea>
        <button class="btn btn-success mt-2" @click="updateChapter">Save Changes</button>
        <button class="btn btn-secondary mt-2 ms-2" @click="showEditForm = false">Cancel</button>
      </div>

      <!-- Chapter Cards -->
      <!-- Chapter Cards -->
<div class="row row-cols-1 row-cols-md-2 g-4">

  <div v-if="chapters.length === 0" class="text-center w-100 text-muted">
    <p>No chapters available for this subject.</p>
  </div>

  <template v-else>
    <div class="col" v-for="chapter in chapters" :key="chapter.id">
      <div class="card h-100 shadow">
        <div class="card-body">
          <h5 class="card-title"><strong>{{ chapter.name }}</strong></h5>
          <p class="card-text">{{ chapter.description }}</p>
          <p><strong>Total Quizzes:</strong> {{ chapter.total_quizzes }}</p>
        </div>
        <div class="card-footer text-center">
          <button class="btn btn-warning btn-sm me-2" @click="startEdit(chapter)"> Edit</button>
          <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)"> Delete</button>
        </div>
      </div>
    </div>
  </template>
</div>

    </div>
  `,

  data() {
    return {
      chapters: [],
      message: "",
      userData: {},
      showCreateForm: false,
      showEditForm: false,
      newChapter: {
        name: "",
        description: ""
      },
      editChapter: {
        id: null,
        name: "",
        description: ""
      },
    };
  },

  mounted() {
    const subjectId = this.$route.params.subject_id;  // used to extract subject_id from the URL
    
    this.loadUser();

    this.fetchChapters(subjectId);
  },

  methods: {

    // for displaying username on the top
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
    
    
    fetchChapters(subjectId) {
      fetch(`/api/chapters/get?subject_id=${subjectId}`, {
        headers: {
          "Content-Type": "application/json",
          "authentication-token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.chapters = data;
        })
        .catch(err => console.error("Error loading chapters:", err));
    },
    

    createChapter() {
      const subjectId = this.$route.params.subject_id;

      fetch('/api/chapters/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "authentication-token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({
          name: this.newChapter.name,
          description: this.newChapter.description,
          subject_id: subjectId    // fetching subject id from the URL
        })
      })
      .then(res => res.json())
      .then(data => {
        this.message = data.message;
        this.showCreateForm = false;
        this.newChapter = { name: "", description: "" }; // used to reset the form fields after creating the chapter
        this.fetchChapters(subjectId);
      });
    },

    startEdit(chapter) {
      this.editChapter = { ...chapter };
      this.showEditForm = true;
    },

    updateChapter() {
      fetch(`/api/chapters/update/${this.editChapter.id}`, {  // editChapter's ID is being referenced from above
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "authentication-token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({
          name: this.editChapter.name,
          description: this.editChapter.description,
          subject_id: this.$route.params.subject_id
        })
      })
      .then(res => res.json())
      .then(data => {
        this.message = data.message;
        this.showEditForm = false;
        this.fetchChapters(this.$route.params.subject_id);
      });
    },

    deleteChapter(id) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;

      fetch(`/api/chapters/delete/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "authentication-token": localStorage.getItem("auth_token")
        }
      })
      .then(res => res.json())
      .then(data => {
        this.message = data.message;
        this.fetchChapters(this.$route.params.subject_id);
      });
    }
  }
};
