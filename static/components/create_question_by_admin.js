export default {
    template: `
      <div class="container mt-5">
        <h2 class="text-center mb-4">Add Question to Quiz ID: {{ quizId }}</h2>
  
        <div v-if="message" class="alert alert-info text-center">{{ message }}</div>
  
        <div class="card mx-auto p-4 shadow" style="width: 30rem;">
          <input v-model="question.question_statement" class="form-control mb-2" placeholder="Question Statement">
          <input v-model="question.option1" class="form-control mb-2" placeholder="Option 1">
          <input v-model="question.option2" class="form-control mb-2" placeholder="Option 2">
          <input v-model="question.option3" class="form-control mb-2" placeholder="Option 3">
          <input v-model="question.option4" class="form-control mb-2" placeholder="Option 4">
          <input v-model.number="question.correct_option" type="number" class="form-control mb-2" placeholder="Correct Option (1-4)">
          
          <button class="btn btn-primary mt-2" @click="submitQuestion">Submit</button>
          <router-link class="btn btn-secondary mt-2 ms-2" to="/adminquiz">Back</router-link>
        </div>
      </div>
    `,
  
    data() {
      return {
        quizId: this.$route.params.quiz_id, // fetches from URL
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
  
    methods: {
      submitQuestion() {
        const payload = {
          quiz_id: this.quizId,
          ...this.question // retrieves all the form values from question || question is an object
        };
  
        fetch('/api/questions/create', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "authentication-token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          this.message = data.message;
          if (data.message === "Question created successfully!") {
            this.question = {  // refreshes the form after successful submission
              question_statement: "",
              option1: "",
              option2: "",
              option3: "",
              option4: "",
              correct_option: null
            };
          }
        });
      }
    }
  };
  