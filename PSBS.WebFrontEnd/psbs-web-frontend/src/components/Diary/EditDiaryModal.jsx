import { Avatar, Modal, Stack } from "@mui/material";
import React, { useRef, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import sampleImage from "../../assets/sampleUploadImage.jpg";
import JoditEditor from "jodit-react";
import Swal from "sweetalert2";

const EditDiaryModal = ({ open, onClose, diary }) => {
  console.log(diary);
  const petInfo = JSON.parse(localStorage.getItem("petInfo"));

  const editor = useRef(null);

  const [content, setContent] = useState(diary?.diary_Content || "");
  const [loading, setLoading] = useState(false);

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

  // Edit diary processing
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
      const response = await fetch(
        `http://localhost:5050/api/PetDiary/${diary?.diary_ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pet_ID: petInfo.petId,
            diary_Content: content,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to create pet diary: ${errorMessage?.message}`,
        });
        return;
      }

      localStorage.setItem("diaryContent", content);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Pet Diary Updated Successfully!`,
      });
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

  return (
    <Modal open={open} onClose={onClose}>
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
    </Modal>
  );
};

export default EditDiaryModal;
