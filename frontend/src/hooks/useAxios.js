import axios from 'axios';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

let requests = 0;
const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach((callback) => callback(requests > 0));
}

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  const queue = failedQueue;
  failedQueue = [];

  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
};

axiosInstance.interceptors.request.use(
  (config) => {
    const csrftoken = Cookies.get('csrftoken');
    if (csrftoken) {
      config.headers['X-CSRFToken'] = csrftoken;
    }

    requests = Math.min(1000, requests + 1);
    notifySubscribers();

    return config;
  },
  (error) => {
    requests = Math.max(0, requests - 1);
    notifySubscribers();

    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    requests = Math.max(0, requests - 1);
    notifySubscribers();

    return response;
  },
  async (error) => {
    requests = Math.max(0, requests - 1);
    notifySubscribers();

    const originalRequest = error.config;

    if (
      window.location.pathname.includes('/login') ||
      window.location.pathname.includes('/register')
    ) {
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/token/refresh/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axiosInstance.post('/auth/token/refresh/');

        if (refreshResponse.status === 200) {
          isRefreshing = false;
          processQueue(null);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Ошибка при обновлении токена:', refreshError);
        isRefreshing = false;
        processQueue(refreshError);

        if (
          refreshError.response &&
          refreshError.response.data &&
          (refreshError.response.data.detail?.includes('истек') ||
            refreshError.response.data.detail?.includes('expired'))
        ) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function useAxios() {
  const [isLoading, setIsLoading] = useState(requests > 0);

  useEffect(() => {
    const processLoading = (isLoading) => {
      setIsLoading(isLoading);
    };

    subscribers.add(processLoading);

    return () => {
      subscribers.delete(processLoading);
    };
  }, []);

  return {
    api: axiosInstance,
    isLoading,
  };
}

export default useAxios;
