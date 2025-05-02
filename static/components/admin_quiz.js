export default {
    template: `
      <div class="container mt-5">
        <h2 class="text-center mb-4">Manage Quizzes</h2>
  
        <div v-if="message" class="alert alert-info text-center">{{ message }}</div>
  
        <!-- CREATE QUIZ FORM -->
        <div v-if="showQuizForm" class="card mx-auto p-4 shadow mb-4" style="width: 30rem;">
          <h4 class="mb-3">Create New Quiz</h4>
          <input v-model="newQuiz.name" class="form-control mb-2" placeholder="Quiz Name">
          <input v-model="newQuiz.chapter_id" class="form-control mb-2" placeholder="Chapter ID">
          <input type="date" v-model="newQuiz.date_of_quiz" class="form-control mb-2">
          <input v-model="newQuiz.time_duration" class="form-control mb-2" placeholder="Duration (HH:MM)">
          <input v-model="newQuiz.remarks" class="form-control mb-2" placeholder="Remarks">
          <button class="btn btn-primary mt-2" @click="createQuiz">Submit</button>
          <button class="btn btn-secondary mt-2 ms-2" @click="showQuizForm = false">Cancel</button>
        </div>
  
        <!-- EDIT QUIZ FORM -->
        <div v-if="showEditQuizForm" class="card mx-auto p-4 shadow mb-4" style="width: 30rem;">
          <h4 class="mb-3">Edit Quiz</h4>
          <input v-model="editQuizData.name" class="form-control mb-2" placeholder="Quiz Name">
          <input v-model="editQuizData.chapter_id" class="form-control mb-2" placeholder="Chapter ID">
          <input type="date" v-model="editQuizData.date_of_quiz" class="form-control mb-2">
          <input v-model="editQuizData.time_duration" class="form-control mb-2" placeholder="Duration (HH:MM)">
          <input v-model="editQuizData.remarks" class="form-control mb-2" placeholder="Remarks">
          <button class="btn btn-success mt-2" @click="updateQuiz">Save Changes</button>
          <button class="btn btn-secondary mt-2 ms-2" @click="showEditQuizForm = false">Cancel</button>
        </div>
  
        <div class="text-center mb-4">
          <button class="btn btn-success" @click="showQuizForm = true">➕ New Quiz</button>
        </div>
  
        <!-- QUIZ CARDS -->
        <div class="row row-cols-1 row-cols-md-2 g-4">
          <div class="col" v-for="quiz in quizzes" :key="quiz.id">
            <div class="card h-100 shadow">
              <div class="card-body">
                <h5 class="card-title"><strong>{{ quiz.name }}</strong></h5>
                <p><strong>Chapter:</strong> {{ quiz.chapter_name || 'Unknown' }}</p>
                <p><strong>No. of Questions:</strong> {{ quiz.no_of_questions }}</p>
                <p><strong>Date:</strong> {{ quiz.date_of_quiz }}</p>
                <p><strong>Duration:</strong> {{ quiz.time_duration }}</p>
                <p><strong>Remarks:</strong> {{ quiz.remarks }}</p>
  
                <h6 class="mt-3">Questions</h6>
                <table class="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Statement</th>
                      <th>Options</th>
                      <th>Correct</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                  <template v-if="quiz.questions && quiz.questions.length > 0">
                  <tr v-for="q in quiz.questions" :key="q.id">
                  <td>{{ q.id }}</td>
      <td>{{ q.question_statement }}</td>
      <td>
        1. {{ q.option1 }}<br>
        2. {{ q.option2 }}<br>
        3. {{ q.option3 }}<br>
        4. {{ q.option4 }}
      </td>
      <td>{{ q.correct_option }}</td>
      <td>
        <button class="btn btn-warning btn-sm" @click="editQuestion(q)">Edit</button>
        <button class="btn btn-danger btn-sm ms-1" @click="deleteQuestion(q.id)">Delete</button>
      </td>
    </tr>
  </template>
  <template v-else>
    <tr>
      <td colspan="5" class="text-center text-muted">No questions available.</td>
    </tr>
  </template>
</tbody>

                </table>
              </div>
              <div class="card-footer text-center">
                <button class="btn btn-info btn-sm" @click="addQuestion(quiz.id)">➕ Question</button>
                <button class="btn btn-warning btn-sm ms-2" @click="startEditQuiz(quiz)">✏️ Edit Quiz</button>
                <button class="btn btn-danger btn-sm ms-2" @click="deleteQuiz(quiz.id)">🗑️ Delete Quiz</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,

    data() {
        return {
            quizzes: [], // list of all quizzes
            chapters: [],  // list of all chapters
            showQuizForm: false,
            showEditQuizForm: false,
            message: "",
            newQuiz: {
                name: "",
                chapter_id: "",
                date_of_quiz: "",
                time_duration: "",
                remarks: ""
            },
            editQuizData: {
                id: null,
                name: "",
                chapter_id: "",
                date_of_quiz: "",
                time_duration: "",
                remarks: ""
            }
        };
    },

    mounted() {
        this.fetchChaptersAndQuizzes();
    },

    methods: {
        fetchChaptersAndQuizzes() {
            const token = localStorage.getItem("auth_token");

            fetch('/api/chapters/get', {
                headers: {
                    "Content-Type": 'application/json',
                    "authentication-token": token
                }
            })
                .then(res => res.json())
                .then(chapters => {
                    this.chapters = chapters; // stores chapters then continue further

                    return fetch('/api/quizzes/get', {
                        headers: {
                            "Content-Type": 'application/json',
                            "authentication-token": token
                        }
                    });
                })
                .then(res => res.json())
                .then(quizzes => {
                    const quizPromises = quizzes.map(quiz =>  // each quiz returns a promise
                        fetch(`/api/questions/get?quiz_id=${quiz.id}`, {  // fetches questions for each quiz
                            headers: { 
                                "Content-Type": 'application/json',
                                "authentication-token": localStorage.getItem("auth_token")
                            }
                        })
                            .then(res => res.json())
                            .then(questions => {  // next line creates a deep copy of the questions array to assign it safely to quiz.questions
                                quiz.questions = JSON.parse(JSON.stringify(questions)); // JSON.stringify(questions) converts the questions array (which contains objects) into a JSON string and JSON.parse(...) then converts that string back into a new array with new object instances.
                                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);// gets chapter name for every quiz to be displayed
                                quiz.chapter_name = chapter ? chapter.name : "Unknown";
                                return quiz;
                            })
                    );

                    Promise.all(quizPromises).then(results => {  // collects all promises 
                        this.quizzes = results;
                    });
                });
        },

        createQuiz() {
            fetch('/api/quizzes/create', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    "authentication-token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.newQuiz)
            })
                .then(res => res.json())
                .then(data => {
                    this.message = data.message;
                    if (data.message === "Quiz created successfully!") {
                        this.showQuizForm = false;
                        this.newQuiz = { name: "", chapter_id: "", date_of_quiz: "", time_duration: "", remarks: "" };
                        this.fetchChaptersAndQuizzes();  // reloads the updated content
                    }
                });
        },

        startEditQuiz(quiz) {
            this.editQuizData = { ...quiz }; // copies everything to editquizdata
            this.editQuizData.date_of_quiz = quiz.date_of_quiz; // keeps date as string
            this.showEditQuizForm = true;
        },

        updateQuiz() {
            fetch(`/api/quizzes/update/${this.editQuizData.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "authentication-token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.editQuizData)
            })
                .then(res => res.json())
                .then(data => {
                    this.message = data.message;
                    if (data.message === "Quiz updated successfully!") {
                        this.showEditQuizForm = false;
                        this.fetchChaptersAndQuizzes();
                    }
                });
        },

        deleteQuiz(id) {
            if (!confirm("Are you sure you want to delete this quiz?")) return;
            fetch(`/api/quizzes/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": 'application/json',
                    "authentication-token": localStorage.getItem("auth_token")
                }
            })
                .then(res => res.json())
                .then(data => {
                    this.message = data.message;
                    this.fetchChaptersAndQuizzes();
                });
        },


        deleteQuestion(questionId) {
            if (!confirm("Are you sure you want to delete this question?")) return;

            fetch(`/api/questions/delete/${questionId}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": 'application/json',
                    "authentication-token": localStorage.getItem("auth_token")
                }
            })
                .then(res => res.json())
                .then(data => {
                    this.message = data.message;

                    // Re-fetch the entire quiz list to update the content
                    this.fetchChaptersAndQuizzes();
                })
                .catch(err => {
                    console.error("Error deleting question:", err);
                });
        },


        addQuestion(quizId) {
            this.$router.push(`/addquestion/${quizId}`); // redirects to create_question_by_admin
        },

        editQuestion(q) {
            this.$router.push(`/editquestion/${q.id}`); // redirects to edit_question_by_admin
        }
    }
};
