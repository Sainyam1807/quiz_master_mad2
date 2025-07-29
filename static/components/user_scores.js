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
      <div class="text-center mt-4">
      <button class="btn btn-success" @click="csvExport">Download CSV</button>
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
  },

  csvExport() {
  const token = localStorage.getItem("auth_token");
  const userId = localStorage.getItem("id"); // user ID stored during login

  if (!userId) {
    alert("User ID not found. Please log in again.");
    return;
  }

  // Call the backend export endpoint with user_id as query parameter
  fetch(`/api/export?user_id=${userId}`, {
    headers: {
      "authentication-token": token
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.id) {
      // Add short delay to allow the Celery task to finish
      setTimeout(() => {
        window.location.href = `/api/csv_result/${data.id}`; // it causes the browser to navigate to that URL || it replaces the current page with the new one.
      }, 3000);  // Waits 3 seconds to give time for Celery to generate the CSV.
    } else {
      alert("Failed to generate CSV.");
    }
  })
  .catch(error => {
    console.error("CSV export error:", error);
    alert("An error occurred while exporting the CSV.");
  });
}

},
mounted() {
  this.fetchScores();
}
};
