import { Avatar, IconButton } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import sampleImage from "../../assets/sampleUploadImage.jpg";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDateString } from "../../Utilities/formatDate";

const PetDiaryCard = ({ petDiary, onEdit, onDelete, role }) => {
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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          {/* Pet Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-customPrimary/20 rounded-full blur-sm"></div>
              <Avatar
                alt={petDiary?.pet?.pet_Name}
                src={
                  petDiary
                    ? `http://localhost:5050/pet-service${petDiary?.pet?.pet_Image}`
                    : sampleImage
                }
                className="relative w-12 h-12 border-2 border-white shadow-sm"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {petDiary?.pet?.pet_Name}
              </h3>
              <span className="text-xs text-gray-500">
                {formatDateString(petDiary?.diary_Date)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {role === "user" && (
              <button
                onClick={onEdit}
                className="group flex items-center justify-center p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                aria-label="Edit diary"
              >
                <EditIcon
                  className="text-blue-600 group-hover:scale-110 transition-transform duration-200"
                  fontSize="small"
                />
              </button>
            )}

            {role === "user" && (
              <button
                onClick={onDelete}
                className="group flex items-center justify-center p-2 rounded-full bg-red-50 hover:bg-red-100 transition-colors duration-200"
                aria-label="Delete diary"
              >
                <DeleteIcon
                  className="text-red-600 group-hover:scale-110 transition-transform duration-200"
                  fontSize="small"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Badge */}
      <div className="px-5 pt-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-customPrimary/10 to-customPrimary/20 text-customPrimary font-medium text-sm">
          <span className="mr-1.5">•</span>
          {petDiary?.category}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-3 pb-5">
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: petDiary?.diary_Content }}
          className={`prose prose-sm max-w-none text-gray-700 overflow-hidden transition-all duration-300 ${
            showAllContent ? "max-h-none" : "max-h-24"
          }`}
        ></div>

        {isOverflowing && (
          <button
            onClick={() => setShowAllContent(!showAllContent)}
            className="mt-2 text-customPrimary hover:text-customPrimary/80 text-sm font-medium flex items-center transition-colors duration-200 focus:outline-none"
          >
            {showAllContent ? (
              <>
                Show less
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            ) : (
              <>
                Show more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PetDiaryCard;
