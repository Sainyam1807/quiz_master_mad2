export default {
  template: `
  <nav class="navbar navbar-expand bg-primary px-3 py-2 rounded mt-3" style="border: 2px solid orange;">
    <div class="d-flex w-100 align-items-center justify-content-between">
      
      <div class="d-flex align-items-center">
        <span class="me-4 text-dark fw-bold">Quiz Master Application</span>
        <router-link to="/" class="nav-link text-dark me-2">Home</router-link>
        <router-link to="/quiz" class="nav-link text-dark me-2">Quiz</router-link>
        <router-link to="/summary" class="nav-link text-dark me-2">Summary</router-link>
        <router-link to="/search" class="nav-link text-dark me-2">Search</router-link>
      </div>

      <div class="d-flex align-items-center">
        <router-link to="/profile" class="nav-link text-dark me-3">Profile</router-link>
        <router-link to="/logout" class="nav-link text-dark">Logout</router-link>
      </div>

    </div>
  </nav>
  `
}
