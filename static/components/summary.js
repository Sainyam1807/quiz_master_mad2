export default {
  template: `
    <div class="container mt-5">
      <h2 class="mb-4">Average Quiz Scores (Admin Summary)</h2>
      <canvas id="summaryChart" height="150"></canvas>
    </div>
  `,
  data() {
    return {
      chart: null
    };
  },
  methods: {
    loadSummary() {
      fetch('/api/scores/summary', {
        headers: {
          'authentication-token': localStorage.getItem('auth_token')
        }
      })
        .then(res => res.json())
        .then(data => {
          const labels = data.map(item => item.quiz_name);
          const values = data.map(item => item.average_score);

          const ctx = document.getElementById('summaryChart').getContext('2d');

          if (this.chart) {
            this.chart.destroy();
          }

          this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Average Score',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        });
    }
  },
  mounted() {
    this.loadSummary();
  }
};
