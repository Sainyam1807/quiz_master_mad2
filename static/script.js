import home from './components/home.js'
import login from './components/login.js'
import register from './components/register.js'
import navbar from './components/navbar.js'
import footer from './components/footer.js'
import admindashboard from './components/admin_dashboard.js'
import userdashboard from './components/user_dashboard.js'
import adminchapters from './components/admin_chapters.js'
import userchapters from './components/user_chapters.js'
import adminmanageusers from './components/manage_users_by_admin.js'
import adminquiz from './components/admin_quiz.js'
import createquestion from './components/create_question_by_admin.js'
import editquestion from './components/edit_question_by_admin.js';



// array of objects || store all the frontend endpoints that render a component
const routes=[
    {path:'/', component: home},
    {path:'/login', component: login},
    {path:'/register', component: register},
    {path:'/admindashboard', component: admindashboard},
    {path: '/dashboard', component: userdashboard},
    {path: '/adminchapters/:subject_id', component: adminchapters},
    {path: '/chapters/:subject_id', component: userchapters},
    {path: '/manageusers', component: adminmanageusers},
    {path: '/adminquiz', component: adminquiz},
    {path: '/addquestion/:quiz_id', component: createquestion},
    {path: '/editquestion/:question_id', component: editquestion}


]

const router = new VueRouter({
    routes //  it means routes: routes || the : routes is the one we have defined above
})


// template here displays the basic structure of every page
// nav-bar is the common nav bar in every page || router-view displays specific component according to endpoint like a placeholder
const app= new Vue({
    el: "#app", 
    router, // it means router: router 

    // <router-view> is a placeholder component provided by Vue Router
    template: `
    <div class="container-fluid p-0">
      <!-- navbar and footer hidden on home, login, and register -->
      <nav-bar v-if="!hideNavAndFooter"></nav-bar>  
      <router-view></router-view>  
      <foot v-if="!hideNavAndFooter"></foot>
    </div>
    `,
    data:{
        section: "Frontend"
    },
    computed: {
        // hiding navbar and footer for these routes like home, login,register
        hideNavAndFooter() {
          return this.$route.path === '/' || this.$route.path === '/login' || this.$route.path === '/register';
        }
      },
    // this tells Vue that inside this component,  two child components (navbar and footer) are registered
    components:{ // these are not replaced everytime they are static || mentioned in templates
        "nav-bar": navbar,
        "foot": footer

    }
})
