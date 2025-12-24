import axios from "axios";

const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Usage example:
// import apiClient from './axiosConfig';
// apiClient.get('/endpoint').then(response => console.log(response.data));
// apiClient.post('/endpoint', data).then(response => console.log(response.data));
// apiClient.put('/endpoint', data).then(response => console.log(response.data));
// apiClient.delete('/endpoint').then(response => console.log(response.data));
// apiClient.patch('/endpoint', data).then(response => console.log(response.data));
// apiClient.head('/endpoint').then(response => console.log(response.data));
// apiClient.options('/endpoint').then(response => console.log(response.data));
// apiClient.request({ method: 'get', url: '/endpoint' }).then(response => console.log(response.data));
// apiClient.all([apiClient.get('/endpoint1'), apiClient.get('/endpoint2')])
//   .then(axios.spread((res1, res2) => {
//     console.log(res1.data, res2.data);
//   }));