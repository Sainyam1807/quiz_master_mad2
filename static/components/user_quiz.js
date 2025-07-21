export default {
  template: `
    <div class="container mt-4" v-if="quizLoaded">
      <h3>Quiz: {{ quizName }}</h3>
      <!-- to properly format the time -->
      <div class="float-end">Time Left: {{ minutes }}:{{ seconds.toString().padStart(2, '0') }}</div>
      <hr>

      <div class="card p-4 mx-auto shadow" style="max-width: 700px;">
        <p class="fw-bold mb-3"><strong>Question {{ currentIndex + 1 }}:</strong> {{ currentQuestion.question_statement }}</p>

        <div class="mb-4" v-for="(opt, index) in options" :key="index">
          <label>
            <input type="radio" :name="'question_' + currentQuestion.id" :value="index+1" v-model="userAnswers[currentQuestion.id]" />
            Option {{ index + 1 }}: {{ opt }}
          </label>
        </div>

        <div class="d-flex justify-content-between">
          <button class="btn btn-warning" @click="prevQuestion" :disabled="currentIndex === 0">Previous</button>
          <div>
            <button class="btn btn-warning me-2" @click="nextQuestion" :disabled="currentIndex === questions.length - 1">Next</button>
            <button class="btn btn-success" v-if="currentIndex === questions.length - 1" @click="submitQuiz">Submit</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      questions: [], // array of questions from the backend 
      userAnswers: {}, // user mapped answers to the questions 
      currentIndex: 0,
      quizLoaded: false, // quiz is loaded or not
      quizName: "",
      duration: 1800, // default 30 mins
      timer: null
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex];
    },
    options() {
      return [
        this.currentQuestion.option1,
        this.currentQuestion.option2,
        this.currentQuestion.option3,
        this.currentQuestion.option4
      ];
    },
    minutes() {
      return Math.floor(this.duration / 60);
    },
    seconds() {
      return this.duration % 60;
    }
  },

  mounted() {

  const quizId = this.$route.params.quiz_id;

  // Get quiz metadata (including duration) using the route mentioned in resources.py
  fetch(`/api/quizzes/get_by_id?quiz_id=${quizId}`, {
    headers: {
      'authentication-token': localStorage.getItem('auth_token')
    }
  })
    .then(res => res.json())
    .then(quiz => {
      this.quizName = quiz.name;

      // to Parse HH:MM format into total seconds
      const durationParts = quiz.time_duration.split(':'); // just splites based on :
      const hours = parseInt(durationParts[0]) || 0; // parseInt just converts string into integers "30" -> 30
      const minutes = parseInt(durationParts[1]) || 0; // || 0: when empty string or undefined, just put 0
      this.duration = (hours * 3600) + (minutes * 60);

      if (this.duration <= 0) {
        console.warn("Invalid duration. Falling back to 30 minutes.");
        this.duration = 1800;
      }

      //  Fetch quiz questions
      return fetch(`/api/questions/get?quiz_id=${quizId}`, {
        headers: {
          'authentication-token': localStorage.getItem('auth_token')
        }
      });
    })
    .then(res => res.json())
    .then(data => {
      this.questions = data;
      this.quizLoaded = true;
      this.startTimer();
    })
    .catch(err => {
      console.error("Error loading quiz:", err);
      alert("Failed to load quiz. Please try again later.");
    });
},


 methods: {
    // simple if condition to go to the next question and previous question  || by setting the currentindex to the updated one, it will directly render that question from template
  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
  },

  prevQuestion() {
    if (this.currentIndex > 0) this.currentIndex--;
  },

  startTimer() {
    this.timer = setInterval(() => {  // runs this code every second 
      if (this.duration > 0) {
        this.duration--;
      } else {
        clearInterval(this.timer); //stops the countdown
        this.safeSubmitQuiz();  //  Call safeSubmit instead of submitQuiz
      }
    }, 1000);
  },

  //  Manual submit from "Submit" button
  submitQuiz() {
    if (!this.$route.params.quiz_id || Object.keys(this.userAnswers).length === 0) { // checks if no answer is submitted 
      alert("Please answer at least one question before submitting.");
      return;
    }
    this.performSubmit();  //  shared submit logic
  },

  //  Auto submit after timeout, but only if some answers exist
  safeSubmitQuiz() {
    if (Object.keys(this.userAnswers).length === 0) {
      alert("Time's up! But no answers were selected, so quiz was not submitted.");
      this.$router.push('/dashboard');
      return;
    }
    this.performSubmit();  //  shared submit logic only if there is atleast one answer
  },

  //  actual submit logic
  performSubmit() {
    const payload = {
      quiz_id: this.$route.params.quiz_id,
      answers: this.userAnswers
    };

    fetch('/api/scores/submit', {  // POST to score in resources,py
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authentication-token': localStorage.getItem('auth_token')
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Quiz Submitted");
      this.$router.push('/dashboard');
    });
  }
}

};
