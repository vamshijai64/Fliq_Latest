import axios from 'axios';

const axiosInstance = axios.create({
    // baseURL: 'http://36.255.253.67:4003',
    // baseURL: 'http://localhost:3003',
    baseURL: 'http://36.255.253.67:4003',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// axiosInstance.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response && error.response.status === 404) {
//             return Promise.resolve({ data: { reviews: [] } }); 
//         }
//         return Promise.reject(error); // Only log other errors
//     }
// );

export default axiosInstance;