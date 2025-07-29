export default {
    template: `
      <div class="container mt-5">
        <h2 class="text-center mb-4">Edit Question ID: {{ questionId }}</h2>
  
        <div v-if="message" class="alert alert-info text-center">{{ message }}</div>
  
        <div class="card mx-auto p-4 shadow" style="width: 30rem;">
          <input v-model="question.question_statement" class="form-control mb-2" placeholder="Question Statement">
          <input v-model="question.option1" class="form-control mb-2" placeholder="Option 1">
          <input v-model="question.option2" class="form-control mb-2" placeholder="Option 2">
          <input v-model="question.option3" class="form-control mb-2" placeholder="Option 3">
          <input v-model="question.option4" class="form-control mb-2" placeholder="Option 4">
          <input v-model.number="question.correct_option" type="number" class="form-control mb-2" placeholder="Correct Option (1-4)">
          
          <button class="btn btn-success mt-2" @click="updateQuestion">Save Changes</button>
          <router-link class="btn btn-secondary mt-2 ms-2" to="/adminquiz">Back</router-link>
        </div>
      </div>
    `,
  
    data() {
      return {
        questionId: this.$route.params.question_id,
        message: "",
        question: {
          question_statement: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correct_option: null
        }
      };
    },
  
    mounted() {
      // this.fetchQuestion();
    },
  
    methods: {
      fetchQuestion() {
        fetch(`/api/questions/get?question_id=${this.questionId}`, {
          headers: {
            "Content-Type": "application/json",
            "authentication-token": localStorage.getItem("auth_token")
          }
        })
          .then(res => res.json())
          .then(data => {
            const q = data[0];  // fetches the first response in an array assuming it doent return a single object
            this.question = {
              question_statement: q.question_statement,
              option1: q.option1,
              option2: q.option2,
              option3: q.option3,
              option4: q.option4,
              correct_option: q.correct_option
            };
          })
          .catch(err => {
            console.error("Error loading question:", err);
          });
      },
  
      updateQuestion() {
        fetch(`/api/questions/update/${this.questionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "authentication-token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify(this.question)
        })
          .then(res => res.json())
          .then(data => {
            this.message = data.message;
          })
          .catch(err => {
            console.error("Error updating question:", err);
          });
      }
    }
  };
  