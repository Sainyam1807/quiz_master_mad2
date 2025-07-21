export default {
    template: `
      <div class="container mt-5">
        <h2 class="text-center mb-4">Manage Users</h2>
        <div v-if="message" class="alert alert-info text-center">{{ message }}</div>
  
        <table class="table table-bordered shadow">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Qualification</th>
              <th>Date of Birth</th>
              <th>Roles</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.qualification }}</td>
              <td>{{ user.dob }}</td>
              <td>{{ user.roles.join(', ') }}</td>
              <td>
              <button v-if="!user.roles.includes('admin')" class="btn btn-danger btn-sm" @click="deleteUser(user.id)">
              Remove
              </button>
              </td>

            </tr>
          </tbody>
        </table>
      </div>
    `,
    data() {
      return {
        users: [],
        message: ""
      };
    },
    mounted() {
      this.fetchUsers();
    },
    methods: {
      fetchUsers() {
        fetch('/api/users/get', {
          headers: {
            'Content-Type': 'application/json',
            'authentication-token': localStorage.getItem('auth_token')
          }
        })
          .then(res => res.json())
          .then(data => this.users = data)
          .catch(err => console.error("Error fetching users:", err));
      },
      deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;
  
        fetch(`/api/users/delete/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'authentication-token': localStorage.getItem('auth_token')
          }
        })
          .then(res => res.json())
          .then(data => {
            this.message = data.message;
            this.fetchUsers();
          });
      }
    }
  };
  