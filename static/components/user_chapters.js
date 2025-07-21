export default {
  template: `
    <div class="container mt-5">

      <!-- Quiz Detail Modal/View Box -->
      <div v-if="selectedQuiz" class="card mb-4 p-3 shadow" style="width: 40rem; margin: auto;">
        <h5 class="text-center mb-3">Quiz Details</h5>
        <p><strong>Name:</strong> {{ selectedQuiz.name }}</p>
        <p><strong>ID:</strong> {{ selectedQuiz.id }}</p>
        <p><strong>Subject:</strong> {{ subjectName }}</p>
        <p><strong>Chapter:</strong> {{ chapterName }}</p>
        <p><strong>No. of Questions:</strong> {{ selectedQuiz.no_of_questions }}</p>
        <p><strong>Date:</strong> {{ selectedQuiz.date_of_quiz }}</p>
        <p><strong>Duration:</strong> {{ selectedQuiz.time_duration }}</p>
        <p><strong>Remarks:</strong> {{ selectedQuiz.remarks }}</p>
        <button class="btn btn-secondary mt-2" @click="selectedQuiz = null">Cancel</button>
      </div>

      <h2 class="text-center mb-4">Chapter Details</h2>
      
      <div class="row row-cols-1 row-cols-md-2 g-4">
        <div class="col" v-for="chapter in chapters" :key="chapter.id">
          <div class="card h-100 shadow">
            <div class="card-body">
              <h5 class="card-title"> {{ chapter.name }}</h5>
              <p class="card-text"><strong>Description:</strong> {{ chapter.description }}</p>
              <p><strong>Total Quizzes:</strong> {{ chapter.total_quizzes }}</p>

              <div v-if="quizzesByChapter[chapter.id] && quizzesByChapter[chapter.id].length">
                <hr>
                <h6>Quizzes:</h6>
                <table class="table table-bordered table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Questions</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="quiz in quizzesByChapter[chapter.id]" :key="quiz.id">
                      <td>{{ quiz.id }}</td>
                      <td>{{ quiz.name }}</td>
                      <td>{{ quiz.no_of_questions }}</td>
                      <td>{{ quiz.date_of_quiz }}</td>
                      <td>{{ quiz.time_duration }}</td>
                      <td>
                        <button class="btn btn-info btn-sm me-2" @click="viewQuiz(quiz, chapter.name)">View</button>
                        <button class="btn btn-success btn-sm" @click="startQuiz(quiz.id)">Start Quiz</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      chapters: [],
      quizzesByChapter: {},
      selectedQuiz: null,
      subjectName: "",
      chapterName: "",
    };
  },

  mounted() {
    const subjectId = this.$route.params.subject_id;
    this.fetchChapters(subjectId).then(() => {  // fetches chapters first then fetches its quizzes and then fetches subjects for displaying subject name
      this.fetchQuizzes();
      this.fetchSubjectName(subjectId);
    });
  },

  methods: {
    fetchChapters(subjectId) {
      return fetch(`/api/chapters/get?subject_id=${subjectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authentication-token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.chapters = data;
        })
        .catch(err => console.error("Error fetching chapters:", err));
    },

    fetchQuizzes() {

      // for every chapter, a fetch() request to get its quizzes is made and .map creates a new array (promises) where each item is a Promise from that fetch.
      const promises = this.chapters.map(chapter =>   // .map: transforms each element of an array and returns a new array
        fetch(`/api/quizzes/get?chapter_id=${chapter.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "authentication-token": localStorage.getItem("auth_token")
          }
        })
          .then(res => res.ok ? res.json() : [])
          .then(data => ({ chapterId: chapter.id, quizzes: data }))
          .catch(err => {
            console.error(`Error fetching quizzes for chapter ${chapter.id}:`, err);
            return { chapterId: chapter.id, quizzes: [] };
          })
      );

      // this waits for all quizzes for all chapters to be fetched
      Promise.all(promises).then(results => {
        const map = {};
        results.forEach(({ chapterId, quizzes }) => {  // storing quizzes in a dictionary where key is chapter ID andvalue is list of quizzes.
          map[chapterId] = quizzes;
        });
        this.quizzesByChapter = map; // storing the result in quizzesByChapter
      });
    },

    // fetching all subjects since there is no : /subjects/get/:id 
    fetchSubjectName(subjectId) {
      fetch('/api/subjects/get', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authentication-token": localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(subjects => {
          const subject = subjects.find(s => s.id == subjectId); // checks if subject id is matching
          this.subjectName = subject ? subject.name : "";
        });
    },

    // to view the quiz details
    viewQuiz(quiz, chapterName) {
      this.selectedQuiz = quiz;
      this.chapterName = chapterName;
    },

    startQuiz(quizId) {
      this.$router.push(`/startquiz/${quizId}`);
    }

  }
};
