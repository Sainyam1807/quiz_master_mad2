export default {
  template: `
    <div class="container mt-5">
      <h2 class="mb-4">Your Quiz Performance vs Average</h2>
      <canvas id="userSummaryChart"></canvas>
    </div>
  `,
  data() {
    return {
      summaryData: []
    };
  },
  methods: {
    async fetchUserSummary() {
      const res = await fetch('/api/user/quiz_summary', {
        headers: {
          'authentication-token': localStorage.getItem('auth_token')
        }
      });

      const data = await res.json();
      this.summaryData = data.summary; 
      this.renderChart(); 
    },
    renderChart() {
      const labels = this.summaryData.map(q => q.quiz_name);
      const userScores = this.summaryData.map(q => q.user_score);
      const averageScores = this.summaryData.map(q => q.average_score);
      const maxScores = this.summaryData.map(q => q.max_score);

      const ctx = document.getElementById('userSummaryChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Your Score',
              data: userScores,
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            },
            {
              label: 'Average Score',
              data: averageScores,
              backgroundColor: 'rgba(255, 206, 86, 0.7)'
            },
            {
              label: 'Max Score',
              data: maxScores,
              backgroundColor: 'rgba(255, 99, 132, 0.3)'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Score' }
            }
          }
        }
      });
    }
  },
  mounted() {
    this.fetchUserSummary();
  }
};
