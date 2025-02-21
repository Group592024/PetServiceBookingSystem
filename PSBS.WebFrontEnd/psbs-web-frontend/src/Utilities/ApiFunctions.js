import axios from "axios";
import Swal from "sweetalert2";


const API_BASE_URL = 'http://localhost:5050'; // Replace with your actual API URL
 // Replace with your actual API URL


// Helper function to handle the response
const handleResponse = (response) => {
  if (response.data.flag) {
    return response.data; // Return data if flag is true
  } else {
    Swal.fire({
      title: "Error!",
      text: response.data.message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

// GET request
export const getData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
    return handleResponse(response);
  } catch (error) {
    console.error("GET request error:", error);
    throw error;
  }
};

// POST request
export const postData = async (endpoint, payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, payload);
    if (!response.data.flag) {
      Swal.fire({
        title: "Error!",
        text:
          response.data.message || "An error occurred while creating the data.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("POST request error:", error);
    if (error.response) {
      Swal.fire({
        title: "Error!",
        text:
          error.response.data.message ||
          "An error occurred while making the request.",
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
  }
};

// PUT request
export const updateData = async (endpoint, payload) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${endpoint}`, payload);
    if (!response.data.flag) {
      Swal.fire({
        title: "Error!",
        text:
          response.data.message || "An error occurred while updating the data.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("PUT request error:", error);
    if (error.response) {
      Swal.fire({
        title: "Error!",
        text:
          error.response.data.message ||
          "An error occurred while making the request.",
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
  }
};

// DELETE request
export const deleteData = async (endpoint) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${endpoint}`);
    if (!response.data.flag) {
      Swal.fire({
        title: "Error!",
        text:
          response.data.message || "An error occurred while deleting the data.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return response.data;
    }
    return response.data;
  } catch (error) {
    console.error("DELETE request error:", error);
    if (error.response) {
      Swal.fire({
        title: "Error!",
        text:
          error.response.data.message ||
          "An error occurred while making the request.",
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
  }
};
