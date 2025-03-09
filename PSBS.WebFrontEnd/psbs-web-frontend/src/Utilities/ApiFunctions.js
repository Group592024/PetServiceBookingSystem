import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = 'http://localhost:5050';

// Helper function to get token from sessionStorage
const getToken = () => {
  return sessionStorage.getItem('token');
};

// Helper function to handle common error cases
const handleCommonErrors = (error) => {
  if (error.response) {
    Swal.fire({
      title: "Error!",
      text: error.response.data.message || "An error occurred while making the request.",
      icon: "error",
      confirmButtonText: "OK",
    });
  } else if (error.request) {
    Swal.fire({
      title: "Error!",
      text: "No response received from the server. Please check your network connection.",
      icon: "error",
      confirmButtonText: "OK",
    });
  } else {
    Swal.fire({
      title: "Error!",
      text: `Unexpected error: ${error.message}`,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
  throw error;
};

// Common function to handle response with token
const handleResponseWithToken = (response) => {
  if (response.data.flag) {
    return response.data;
  } else {
    Swal.fire({
      title: "Error!",
      text: response.data.message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

// GET request with token
export const getData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return handleResponseWithToken(response);
  } catch (error) {
    console.error("GET request error:", error);
    handleCommonErrors(error);
  }
};

// POST request with token
export const postData = async (endpoint, payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, payload, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return handleResponseWithToken(response);
  } catch (error) {
    console.error("POST request error:", error);
    handleCommonErrors(error);
  }
};

// PUT request with token
export const updateData = async (endpoint, payload) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${endpoint}`, payload, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return handleResponseWithToken(response);
  } catch (error) {
    console.error("PUT request error:", error);
    handleCommonErrors(error);
  }
};

// DELETE request with token
export const deleteData = async (endpoint) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    return handleResponseWithToken(response);
  } catch (error) {
    console.error("DELETE request error:", error);
    handleCommonErrors(error);
  }
};
