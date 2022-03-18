import Axios from 'axios';

const apiInstance = Axios.create({
  baseURL: 'http://localhost:8081/data',
  headers: {
    'Pragma': 'no-cache',
    'Content-Type': 'application/json; charset=UTF-8',
  }
});

apiInstance.interceptors.response.use((response) => {
  return {
    ...response,
    total: response.data.length,
  };
}, (error) => {
  return Promise.reject(error);
}, {synchronous: true});

export default apiInstance;