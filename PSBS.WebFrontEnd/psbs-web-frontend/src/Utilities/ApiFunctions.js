import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:5023'; // Replace with your actual API URL

// Helper function to handle the response
const handleResponse = (response) => {
  if (response.data.flag) {
    return response.data; // Return data if flag is true
  } else {
     Swal.fire({
            title: 'Error!',
            text: response.data.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
    
  }
};

// GET request
export const getData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
    return handleResponse(response);
  } catch (error) {
    console.error('GET request error:', error);
    throw error;
  }
};

// POST request
export const postData = async (endpoint, payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, payload);
    return handleResponse(response);
  } catch (error) {
    console.error('POST request error:', error);
    throw error;
  }
};

// PUT request
export const updateData = async (endpoint, payload) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${endpoint}`, payload);
    return handleResponse(response);
  } catch (error) {
    console.error('PUT request error:', error);
    throw error;
  }
};

// DELETE request
export const deleteData = async (endpoint) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${endpoint}`);
    return handleResponse(response);
  } catch (error) {
    console.error('DELETE request error:', error);
    throw error;
  }
};
