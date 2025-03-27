import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true, 
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (window.location.pathname.includes('/login') || 
        window.location.pathname.includes('/register')) {
      return Promise.reject(error);
    }
    
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/token/refresh/')
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/token/refresh/', 
          {}, 
          { withCredentials: true }
        );
        
        if (refreshResponse.status === 200) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const useAxios = () => axiosInstance;

export default useAxios;