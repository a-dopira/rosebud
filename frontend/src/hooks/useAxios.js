import axios from "axios";

const baseURL = "http://127.0.0.1:8000/api/";

const useAxios = () => {
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true, 
  });
  
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await instance.post('/token/refresh/', {}, { withCredentials: true });
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;