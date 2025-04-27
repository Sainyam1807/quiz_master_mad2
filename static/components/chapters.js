export default {
  template: `
    <div class="container mt-5">
      <h3 class="mb-4 text-center">Chapters Available</h3>
      <div class="row row-cols-1 row-cols-md-2 g-4">
        <div class="col" v-for="chapter in chapters" :key="chapter.id">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title"><strong>{{ chapter.name }}</strong></h5>
              <p class="card-text"><strong>Description:</strong> {{ chapter.description }}</p>
              <p class="card-text"><strong>Total Quizzes:</strong> {{ chapter.total_quizzes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data: function () {
    return {
      chapters: null
    };
  },
  mounted() {
  
    const subjectId = this.$route.params.subject_id;  // the path parameter: subject_id is extracted
    
    // this route present in resources.py
    fetch(`/api/chapters/get?subject_id=${subjectId}`, {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
        "authentication-token": localStorage.getItem("auth_token")
      }
    })
    .then(response => response.json())
    .then(data => {
      this.chapters = data;
    })
    .catch(error => {
      console.error("Error fetching chapters:", error);
    });
  }
}
