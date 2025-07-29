export default {
  template: `
    <div class="container mt-5">
      <h2 class="mb-4">Search Results</h2>
      <div class="mb-3">
        <input v-model="searchQuery" class="form-control" placeholder="Enter your search again...">
        <button class="btn btn-primary mt-2" @click="reSearch">Search</button>
      </div>

      <div v-if="results.length === 0">
        <p>No results found.</p>
      </div>

      <div v-else>
        <ul class="list-group">
          <li class="list-group-item" v-for="r in results" :key="r.id">
            <!-- User Details -->
            <div v-if="type === 'user'">
              <strong>User:</strong> {{ r.username }}<br/>
              Email: {{ r.email }}<br/>
              DOB: {{ r.dob }}<br/>
              Qualification: {{ r.qualification }}<br/>
              Roles: {{ r.roles.join(', ') }}
            </div>

            <!-- Subject Details -->
            <div v-else-if="type === 'subject'">
              <strong>Subject:</strong> {{ r.name }}<br/>
              Description: {{ r.description }}<br/>
              Category: {{ r.category }}<br/>
              Total Chapters: {{ r.total_chapters }}
            </div>

            <!-- Quiz Details -->
            <div v-else-if="type === 'quiz'">
              <strong>Quiz:</strong> {{ r.name }}<br/>
              Chapter: {{ r.chapter_name }}<br/>
              Date: {{ r.date_of_quiz }}<br/>
              Duration: {{ r.time_duration }}<br/>
              Remarks: {{ r.remarks }}<br/>
              Questions: {{ r.no_of_questions }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  data() {
    return {
      searchQuery: this.$route.query.query || "", // default to query param or empty string
      type: this.$route.query.type || "user", // default to 'user' or 'subject' or 'quiz'
      results: []
    };
  },
  methods: {
    fetchResults() { // fetch results based on search query and type
      if (!this.searchQuery.trim()) {
        this.results = [];
        return;
      }

      fetch(`/api/search?query=${this.searchQuery}`, {
        headers: {
          'authentication-token': localStorage.getItem('auth_token')
        }
      })
        .then(res => res.json())
        .then(data => {
          const keyMap = {   // map type to API response keys
            user: 'users',
            subject: 'subjects',
            quiz: 'quizzes'
          };
          const mappedKey = keyMap[this.type];  // get the key based on type
          this.results = data[mappedKey] || [];  // set results based on type
        });
    },
    reSearch() { // redirect to search results page with updated query
      this.$router.push({
        path: '/searchresults',
        query: { query: this.searchQuery, type: this.type } 
      }).then(() => {
        this.fetchResults(); // ensures fetch works even if query is same
      });
    }
  },
  watch: { // watch for changes in route query params
    '$route.query': {
      handler(newQuery) { // update searchQuery and type based on new query params
        this.searchQuery = newQuery.query || '';
        this.type = newQuery.type || 'user';
        this.fetchResults();
      },
      immediate: true // fetch results immediately on component mount
    }
  }
};
