import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5012/api',
});

export default apiClient;
