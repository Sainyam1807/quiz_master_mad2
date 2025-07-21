export default {
  template: `
    <div class="container mt-4">
      <h2 class="text-center mb-4">Your Quiz Attempts</h2>
      <div class="row">
        <div v-for="score in scores" :key="score.attempted_on" class="card p-3 m-3 shadow" style="width: 350px;">
        <p><strong>Quiz:</strong> {{ score.quiz_name }}</p>
        <p><strong>Chapter:</strong> {{ score.chapter_name }}</p>
        <p><strong>Subject:</strong> {{ score.subject_name }}</p>
        <p><strong>Score:</strong> {{ score.total_scored }}</p>
        <p><strong>Date of Attempt:</strong> {{ formatDate(score.time_stamp_of_attempt) }}</p>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      scores: []
    };
  },
  methods: {
  // fetches user scores from the API and stores in component state
  fetchScores() {
    const token = localStorage.getItem("auth_token");
    fetch("/api/scores/get", {
        headers: {
            "authentication-token": token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch scores");
        }
        return response.json();
    })
    .then(data => {
        this.scores = data;
    })
    .catch(error => {
        console.error("Error fetching scores:", error);
        alert("Failed to fetch scores.");
    });
},

  // formats ISO date string into a readable format
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString();
  }
},
mounted() {
  this.fetchScores();
}
};
