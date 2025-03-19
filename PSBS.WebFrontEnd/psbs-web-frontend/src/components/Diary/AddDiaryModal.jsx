import { Autocomplete, Avatar, Modal, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import sampleImage from "../../assets/sampleUploadImage.jpg";
import JoditEditor from "jodit-react";
import Swal from "sweetalert2";

const AddDiaryModal = ({ open, onClose }) => {
  const petInfo = JSON.parse(localStorage.getItem("petInfo"));

  const editor = useRef(null);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const config = {
    readonly: false,
    placeholder: "Start typings...",
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "align",
      "|",
      "link",
      "image",
    ],
    uploader: {
      insertImageAsBase64URI: true,
    },
    events: {
      error: (e) => alert("Upload failed:", e),
    },
  };

  const handleSave = async () => {
    if (content === "") {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "The content can not be empty!",
      });
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      console.log("pet id ne: " + petInfo?.petId);
      console.log("content ne: " + content);

      const response = await fetch("http://localhost:5050/api/PetDiary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pet_ID: petInfo?.petId,
          diary_Content: content,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();

        return Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to create pet diary: ${errorMessage?.message}`,
        });
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Pet Diary Created Successfully!`,
      });
      setSelectedCategory("");

      console.log("current category: " + selectedCategory);

      setContent("");
      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save the diary. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        `http://localhost:5050/api/PetDiary/categories/${petInfo?.petId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const listCategories = response.data.data;
      console.log(listCategories);
      setCategories(listCategories);

      //return listCategories;
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <Stack
          spacing={4}
          className="px-8 py-12 bg-customLightPrimary w-2/3 mx-auto mt-[10%] max-h-[500px]"
        >
          <div className="flex justify-start items-center gap-4 w-full">
            <button onClick={onClose}>
              <ArrowBackIosIcon />
            </button>

            <div className="flex justify-center items-center gap-2">
              <Avatar
                alt={petInfo?.petName}
                src={petInfo?.petImage || sampleImage}
              />
              <h3 className="font-bold">{petInfo?.petName}</h3>
            </div>
          </div>

          <div className="flex justify-between">
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option}
              value={selectedCategory}
              onChange={handleCategoryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select category"
                  variant="outlined"
                />
              )}
              sx={{ width: "300px" }}
            />
            <span className="me-4">Create new category: </span>
            <TextField onChange={(e) => setSelectedCategory(e.target.value)} />
          </div>

          <div
            style={{
              borderRadius: "0.5rem",
              overflowY: "auto",
              maxHeight: "300px",
            }}
            className="no-scroll-bar"
          >
            <JoditEditor
              ref={editor}
              value={content}
              config={config}
              tabIndex={1}
              onBlur={(newContent) => setContent(newContent)}
            />
          </div>

          <div className="flex justify-center mt-8">
            <button
              className={`rounded-full px-8 py-4 bg-customPrimary text-customLight w-1/3 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
              onClick={handleSave}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </Stack>
      </div>
    </Modal>
  );
};

export default AddDiaryModal;
