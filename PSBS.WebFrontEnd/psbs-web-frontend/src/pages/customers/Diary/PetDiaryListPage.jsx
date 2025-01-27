import React, { useEffect, useState } from 'react';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import SampleImage from '../../../assets/sampleUploadImage.jpg';
import { CircularProgress, Stack } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PetDiaryCardList from '../../../components/Diary/PetDiaryCardList';
import AddDiaryModal from '../../../components/Diary/AddDiaryModal';
import { ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { formatDateString } from '../../../Utilities/formatDate';

const PetDiaryListPage = () => {
  const petId =
    localStorage.getItem('petId') || '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [petDiary, setPetDiary] = useState();

  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchPetDiary = async (petId, pageIndex) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5010/api/PetDiary/diaries/${petId}?pageIndex=${pageIndex}&pageSize=4`,
        {
          headers: {
            method: 'GET',
          },
        }
      );

      const data = await response.json();

      if (data.flag) {
        localStorage.setItem(
          'petInfo',
          JSON.stringify({
            petId:
              localStorage.getItem('petId') ||
              '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            petName: data?.data[0]?.pet?.pet_Name,
            petImage: data?.data[0]?.pet?.pet_Image,
            petDoB: data?.data[0]?.pet?.date_Of_Birth,
          })
        );

        setPetDiary(data?.data);
      }

      if (!data.flag) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to create pet diary: ${data.message}`,
        });
      }
    } catch {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again!',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetDiary(petId, pageIndex);
  }, [petId, pageIndex]);

  // Pagination handler
  const handleClickNext = () => {
    setPageIndex((prev) => prev + 1);
  };

  const handleClickPrevious = () => {
    setPageIndex((prev) => prev - 1);
  };

  // Add Pet Modal Processing
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    fetchPetDiary(petId, 1);
  };

  return (
    <div>
      <NavbarCustomer />

      {loading ? (
        <div className='flex justify-center items-center py-12'>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className='flex justify-center items-center gap-8 px-8 py-12'>
            <Stack
              spacing={4}
              className='flex flex-col justify-center items-center w-1/3'
            >
              <div className='py-8 px-6 bg-customPrimary rounded-xl'>
                <img
                  src={(petDiary && petDiary[0]?.pet?.pet_Image) || SampleImage}
                  alt='sample-image'
                  className='rounded-[2.6rem]'
                />
                <h2 className='text-3xl font-bold text-center mt-4'>
                  {petDiary && petDiary[0]?.pet?.pet_Name}
                </h2>
                <p className='text-lg text-center'>
                  {petDiary &&
                    formatDateString(petDiary[0]?.pet?.date_Of_Birth)}
                </p>
              </div>

              <button
                to={'add'}
                className='m-auto text-center rounded-s-full rounded-e-full bg-customPrimary py-2 px-4 w-1/2 hover:opacity-90'
                onClick={() => setAddModalOpen(true)}
              >
                <AddCircleOutlineIcon /> New Post
              </button>
            </Stack>

            <div className='w-2/3'>
              <PetDiaryCardList
                data={petDiary}
                onCLickNext={handleClickNext}
                onClickPrevious={handleClickPrevious}
              />
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
