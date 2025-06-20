import PetDiaryCard from "./PetDiaryCard";
import { Stack } from "@mui/material";
import Swal from "sweetalert2";
import EditDiaryModal from "./EditDiaryModal";
import { useState } from "react";

const PetDiaryCardList = ({ data, role, getCategories }) => {
  const [diaries, setDiaries] = useState(data);
  const [clickedDiary, setClickedDiary] = useState(null);
  const [open, setOpen] = useState(false);

  // Delete Diary Processing
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        const fetchDelete = async () => {
          try {
            const token = sessionStorage.getItem("token");
            const deleteResponse = await fetch(
              `http://localhost:5050/api/PetDiary/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (deleteResponse.ok) {
              setDiaries(diaries?.filter((item) => item?.diary_ID !== id));
              Swal.fire("Deleted!", "The diary has been deleted.", "success");
            } else {
              Swal.fire("Error!", "Failed to delete the diary", "error");
            }
          } catch (error) {
            console.log(error);
            Swal.fire("Error!", "Failed to delete the diary", "error");
          }
        };

        fetchDelete();
      }
    });
  };

  // Edit Modal Processing
  const handleCloseEditModal = () => {
    const diaryIndex = diaries.findIndex(
      (item) => item.diary_ID === clickedDiary.diary_ID
    );

    if (diaryIndex !== -1) {
      diaries[diaryIndex].diary_Content =
        localStorage.getItem("diaryContent") || clickedDiary.diary_Content;
      diaries[diaryIndex].category =
        localStorage.getItem("category") || clickedDiary.category;
      diaries[diaryIndex].diary_Date = new Date().toISOString();
    }

    setClickedDiary(null);
    console.log("ngay ne" + new Date().toISOString());
    localStorage.removeItem("diaryContent");
    localStorage.removeItem("category");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {diaries?.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {diaries.map((item) => (
            <div
              key={item?.diary_ID}
              className="py-5 first:pt-0 last:pb-0 transition-all duration-300 hover:bg-gray-50 rounded-xl px-2"
            >
              <PetDiaryCard
                role={role}
                petDiary={item}
                onEdit={() => {
                  setClickedDiary(item);
                  setOpen(true);
                }}
                onDelete={() => handleDelete(item?.diary_ID)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 italic">No diary entries to display</p>
        </div>
      )}

      {clickedDiary && (
        <EditDiaryModal
          open={open}
          onClose={handleCloseEditModal}
          diary={clickedDiary}
          getCategories={getCategories}
        />
      )}
    </div>
  );
};

export default PetDiaryCardList;
