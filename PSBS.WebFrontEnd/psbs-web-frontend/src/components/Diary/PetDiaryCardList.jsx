import PetDiaryCard from "./PetDiaryCard";
import { Stack } from "@mui/material";
import Swal from "sweetalert2";
import EditDiaryModal from "./EditDiaryModal";
import { useState } from "react";

const PetDiaryCardList = ({ data }) => {
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
              Swal.fire("Deleted!", "The service has been deleted.", "success");
            } else {
              Swal.fire("Error!", "Failed to delete the service", "error");
            }
          } catch (error) {
            console.log(error);
            Swal.fire("Error!", "Failed to delete the service", "error");
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
    }

    setClickedDiary(null);
    localStorage.removeItem("diaryContent");
    setOpen(false);
  };

  return (
    <Stack>
      <div className="pr-2">
        {diaries?.map((item) => (
          <PetDiaryCard
            key={item?.diary_ID}
            petDiary={item}
            onEdit={() => {
              setClickedDiary(item);
              setOpen(true);
            }}
            onDelete={() => handleDelete(item?.diary_ID)}
          />
        ))}
      </div>

      {clickedDiary && (
        <EditDiaryModal
          open={open}
          onClose={handleCloseEditModal}
          diary={clickedDiary}
        />
      )}
    </Stack>
  );
};

export default PetDiaryCardList;
