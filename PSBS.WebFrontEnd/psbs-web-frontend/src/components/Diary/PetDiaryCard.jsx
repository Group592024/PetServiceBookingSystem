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
    <div className="bg-white p-6 my-4 rounded-2xl shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center gap-3">
          <Avatar
            alt={petDiary?.pet?.pet_Name}
            src={
              petDiary
                ? `http://localhost:5010${petDiary?.pet?.pet_Image}`
                : sampleImage
            }
          />
          <h3 className="font-bold text-lg">{petDiary?.pet?.pet_Name}</h3>
        </div>

        <div className="flex justify-between items-center">
          <span className="italic me-4">
            Last update: {formatDateString(petDiary?.diary_Date)}
          </span>
          <span className="bg-customLightPrimary p-1 rounded-xl hover:scale-125 mr-2 border-2 border-customPrimary">
            <IconButton aria-label="edit" onClick={onEdit} color="info">
              <EditIcon />
            </IconButton>
          </span>

          <span className="bg-customLightDanger p-1 rounded-xl hover:scale-125 mr-2 border-2 border-customDanger">
            <IconButton aria-label="delete" onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </span>
        </div>
      </div>
      <div className="mt-2">
        <p className="">
          Topic:{" "}
          <span className=" ml-3 text-lg py-2 px-6 bg-customLightPrimary text-customPrimary font-semibold rounded-full">
            {petDiary?.category}
          </span>
        </p>
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
