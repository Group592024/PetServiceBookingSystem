import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const api = axios.create({
  baseURL: 'http://localhost:5143',
  withCredentials: true,
});

const handleApiError = (error) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || 'Something went wrong';
  toast.error(message, { position: 'top-right', autoClose: 5000 });
};

export const getMedicinesList = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
