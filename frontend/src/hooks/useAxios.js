import axios from "axios";


const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, 
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/token/refresh/')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}token/refresh/`, 
          {}, 
          { withCredentials: true }
        );
        
        if (refreshResponse.status === 200) {
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.log(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const useAxios = () => axiosInstance;

export default useAxios;