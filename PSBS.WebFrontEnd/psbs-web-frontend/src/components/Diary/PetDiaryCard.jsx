import { Avatar, IconButton } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import sampleImage from "../../assets/sampleUploadImage.jpg";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDateString } from "../../Utilities/formatDate";

const PetDiaryCard = ({ petDiary, onEdit, onDelete }) => {
  const [showAllContent, setShowAllContent] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setIsOverflowing(scrollHeight > clientHeight);
    }
  }, [petDiary]);

  return (
    <div className="bg-customLightPrimary p-6 my-4 rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center gap-3">
          <Avatar
            alt={petDiary?.pet?.pet_Name}
            src={petDiary?.pet?.pet_Image || sampleImage}
          />
          <h3 className="font-bold text-lg">{petDiary?.pet?.pet_Name}</h3>
        </div>

        <div className="flex justify-between items-center">
          <span className="me-6">
            <p className="text-xl p-2 bg-white text-customPrimary font-bold rounded-lg w-20">
              {petDiary?.category}
            </p>
          </span>
          <span className="italic me-4">
            {formatDateString(petDiary?.diary_Date)}
          </span>
          <IconButton aria-label="edit" onClick={onEdit} color="info">
            <EditIcon />
          </IconButton>

          <IconButton aria-label="delete" onClick={onDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
      <div
        ref={contentRef}
        id="content"
        dangerouslySetInnerHTML={{ __html: petDiary?.diary_Content }}
        className={`mt-6 ${showAllContent ? "" : "line-clamp-3"}`}
      ></div>{" "}
      {isOverflowing &&
        (!showAllContent ? (
          <span
            className="font-thin text-customPrimary text-sm hover:cursor-pointer hover:opacity-90"
            onClick={() => setShowAllContent(true)}
          >
            See more
          </span>
        ) : (
          <span
            className="font-thin text-customPrimary text-sm hover:cursor-pointer hover:opacity-90"
            onClick={() => setShowAllContent(false)}
          >
            Hide
          </span>
        ))}
    </div>
  );
};

export default PetDiaryCard;
