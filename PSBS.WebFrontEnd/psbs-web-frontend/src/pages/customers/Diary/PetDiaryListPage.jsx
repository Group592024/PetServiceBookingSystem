import React, { useEffect, useState } from "react";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import SampleImage from "../../../assets/sampleUploadImage.jpg";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PetDiaryCardList from "../../../components/Diary/PetDiaryCardList";
import AddDiaryModal from "../../../components/Diary/AddDiaryModal";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { formatDateString } from "../../../Utilities/formatDate";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useParams } from "react-router-dom";

const PetDiaryListPage = () => {
  const { petId } = useParams();
  const petInfo = JSON.parse(localStorage.getItem("petInfo"));

  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [petDiary, setPetDiary] = useState({ data: [], meta: null });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchPetDiary = async (petId, selectedCategory, pageIndex) => {
    try {
      console.log("category ne troi: " + selectedCategory);
      console.log("pageindex ne troi: " + pageIndex);
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5050/api/PetDiary/diaries/${petId}?category=${selectedCategory}&pageIndex=${pageIndex}&pageSize=4`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) return;
      }

      const data = await response.json();

      if (data.flag) {
        setPetDiary(data?.data);
      }

      if (!data.flag) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `${data.message}`,
        });
      }
    } catch {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetDiary(petId, selectedCategory, pageIndex);
  }, [petId, selectedCategory, pageIndex]);

  // Pagination handler
  const handleClickNext = () => {
    if (pageIndex >= petDiary?.meta?.totalPages) return;
    setPageIndex((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    if (pageIndex <= 1) return;
    setPageIndex((prev) => prev - 1);
  };

  // Add Pet Modal Processing
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    fetchPetDiary(petId, selectedCategory, 1);
    setSelectedCategory("All");
  };

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        `http://localhost:5050/api/PetDiary/categories/${petId}`,
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
  }, [selectedCategory, petDiary]);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <div>
      <NavbarCustomer />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="px-8 py-5">
            <div className="flex justify-center">
              <Stack
                spacing={2}
                className="flex flex-col justify-center items-center w-1/3"
              >
                <div className="py-8 px-6 bg-customPrimary rounded-xl">
                  <img
                    src={
                      petInfo
                        ? `http://localhost:5010${petInfo.petImage}`
                        : SampleImage
                    }
                    alt="sample-image"
                    className="rounded-[2.6rem] max-h-96 w-[380px]"
                  />
                  <h2 className="text-4xl font-bold text-center mt-4 mb-1 text-white">
                    {petInfo && petInfo.petName}
                  </h2>
                  <p className="text-lg text-center text-white">
                    {petInfo && formatDateString(petInfo.petDoB)}
                  </p>
                </div>

                <button
                  to={"add"}
                  className="m-auto flex justify-center items-center gap-1 text-center rounded-s-full rounded-e-full bg-customPrimary text-white py-2 px-4 w-1/2 hover:opacity-90"
                  onClick={() => setAddModalOpen(true)}
                >
                  <AddCircleOutlineIcon /> New Post
                </button>
              </Stack>
            </div>

            <Autocomplete
              options={["All", ...categories]}
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

            <div className="flex justify-center">
              <Stack className="w-3/4">
                {petDiary?.data?.length !== 0 ? (
                  <>
                    <PetDiaryCardList data={petDiary?.data} />
                    <div className="flex justify-center items-center gap-4 w-1/3 mx-auto mt-4">
                      <Button
                        variant="contained"
                        onClick={handleClickPrevious}
                        disabled={pageIndex <= 1}
                        className="flex justify-center items-center gap-1"
                      >
                        <ArrowBackIosIcon fontSize="1rem" /> Previous
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleClickNext}
                        disabled={pageIndex >= petDiary?.meta?.totalPages}
                        className="flex justify-center items-center gap-1"
                      >
                        Next <ArrowForwardIosIcon fontSize="1rem" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-2xl font-semibold text-center">
                    No diaries found
                  </p>
                )}
              </Stack>
            </div>
          </div>
        </>
      )}
      <AddDiaryModal open={addModalOpen} onClose={handleCloseAddModal} />
      <ToastContainer />
    </div>
  );
};

export default PetDiaryListPage;
