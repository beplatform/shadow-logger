import Axios from 'axios';

const apiInstance = Axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Pragma': 'no-cache',
    'Content-Type': 'application/json; charset=UTF-8',
  }
});

apiInstance.interceptors.response.use((response) => {
  if (response.headers['x-total-count']) {
    return {
      ...response,
      total: parseInt(response.headers['x-total-count'])
    };
  }
  return response;
}, (error) => {
  return Promise.reject(error);
}, {synchronous: true});

export default apiInstance;