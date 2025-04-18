import { Autocomplete, Avatar, Modal, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import sampleImage from "../../assets/sampleUploadImage.jpg";
import JoditEditor from "jodit-react";
import Swal from "sweetalert2";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

// Add onCategoryCreate prop to allow parent component to refresh categories
const AddDiaryModal = ({ categories, open, onClose, onCategoryCreate }) => {
  const petInfo = JSON.parse(localStorage.getItem("petInfo"));

  const editor = useRef(null);
  const [newCategoryName, setNewCategoryName] = useState(""); // Add state for new category name
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleCloseAddModal = () => {
    setOpenCategory(false);
    setNewCategoryName(""); // Reset the new category name when closing
  };

  // Handle creating a new category
  const handleCreateCategory = () => {
    if (newCategoryName.trim() !== "") {
      setSelectedCategory(newCategoryName);

      // If onCategoryCreate prop exists, call it with the new category
      if (onCategoryCreate && typeof onCategoryCreate === "function") {
        onCategoryCreate(newCategoryName);
      }

      setOpenCategory(false);
      setNewCategoryName("");
    } else {
      Swal.fire({
        icon: "warning",
        title: "Empty Category",
        text: "Please enter a category name",
      });
    }
  };

  const config = {
    readonly: false,
    placeholder: "Start typing your diary entry...",
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
    console.log(content);
    const sanitizedContent = content.replace(/<[^>]+>/g, "").trim();
    console.log(sanitizedContent);
    if (!sanitizedContent) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "The content can not be empty!",
      });
    }

    if (!selectedCategory) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "The category can not be empty!",
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

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  // Update selectedCategory when categories change (e.g., after adding a new one)
  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      !categories.includes(selectedCategory)
    ) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  return (
    <Modal open={open} onClose={onClose} data-testid="add-diary-modal">
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="bg-customLightPrimary w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden transform transition-all">
          {/* Header */}
          <div className="px-8 py-6 bg-customPrimary text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <ArrowBackIosIcon />
              </button>
              <h2 className="text-xl font-bold">Create New Diary Entry</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-10 py-6 max-h-[75vh] overflow-y-auto">
            {/* Pet Info */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-white/50 rounded-lg">
              <Avatar
                alt={petInfo?.petName}
                src={
                  petInfo
                    ? `http://localhost:5010${petInfo?.petImage}`
                    : sampleImage
                }
                className="h-12 w-12 border-2 border-customPrimary"
              />
              <div>
                <h3 className="font-bold text-customDark">
                  {petInfo?.petName}
                </h3>
                <p className="text-sm text-customDarkGrey">New diary entry</p>
              </div>
            </div>

            {/* Category Selection */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Autocomplete
                  data-testid="category-select"
                  options={categories}
                  getOptionLabel={(option) => option}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select your topic"
                      variant="outlined"
                      className="bg-white rounded-lg"
                    />
                  )}
                  sx={{ width: "100%" }}
                />
              </div>
              <button
                className="flex justify-center items-center gap-2 rounded-lg
                  bg-customDark text-white py-3 px-5 hover:bg-opacity-90 transition-all
                  transform hover:scale-105 shadow-md"
                onClick={() => setOpenCategory(true)}
              >
                <AddCircleOutlineIcon /> New topic
              </button>
            </div>

            {/* Editor */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 w-full">
              <div className="p-2 bg-customGrey/30 border-b border-customGrey">
                <p className="text-sm text-customDarkGrey">
                  💡 Tip: You can add images by clicking the image icon
                </p>
              </div>
              <JoditEditor
                data-testid="content-editor"
                ref={editor}
                value={content}
                config={{
                  ...config,
                  width: "100%",
                  height: 350,
                  toolbarAdaptive: false,
                  showCharsCounter: false,
                  showWordsCounter: false,
                  showXPathInStatusbar: false,
                }}
                tabIndex={1}
                onBlur={(newContent) => setContent(newContent)}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="rounded-lg px-6 py-3 bg-customGrey text-customDark font-medium
                  hover:bg-opacity-80 transition-all"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`rounded-lg px-8 py-3 bg-customPrimary text-white font-medium
                  shadow-lg hover:shadow-xl transition-all transform hover:translate-y-[-2px]
                  ${
                    loading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-opacity-90"
                  }`}
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Diary"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* New Category Modal */}
        <Modal open={openCategory} onClose={handleCloseAddModal}>
          <div className="flex justify-center items-center min-h-screen p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all">
              <h3 className="text-customPrimary font-bold text-xl mb-4 border-b pb-2">
                Create New Category
              </h3>

              <TextField
                fullWidth
                label="Category Name"
                variant="outlined"
                placeholder="Enter a new category name"
                className="mb-6"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-5 py-2 rounded-lg border border-customDarkGrey text-customDark
                    hover:bg-customGrey transition-colors"
                  onClick={handleCloseAddModal}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-customPrimary text-white
                    hover:bg-opacity-90 transition-all shadow-md"
                  onClick={handleCreateCategory}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

export default AddDiaryModal;
