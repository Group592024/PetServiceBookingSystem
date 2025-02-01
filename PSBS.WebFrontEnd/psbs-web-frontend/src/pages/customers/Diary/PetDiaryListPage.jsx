import React, { useEffect, useState } from 'react';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import SampleImage from '../../../assets/sampleUploadImage.jpg';
import { Button, CircularProgress, Stack } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PetDiaryCardList from '../../../components/Diary/PetDiaryCardList';
import AddDiaryModal from '../../../components/Diary/AddDiaryModal';
import { ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { formatDateString } from '../../../Utilities/formatDate';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const PetDiaryListPage = () => {
  const petId =
    localStorage.getItem('petId') || '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [petDiary, setPetDiary] = useState({ data: [], meta: null });

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

      if (!response.ok) {
        if (response.status === 404) return;
      }

      const data = await response.json();

      if (data.flag) {
        localStorage.setItem(
          'petInfo',
          JSON.stringify({
            petId:
              localStorage.getItem('petId') ||
              '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            petName: data?.data?.data[0]?.pet?.pet_Name,
            petImage: data?.data?.data[0]?.pet?.pet_Image,
            petDoB: data?.data?.data[0]?.pet?.date_Of_Birth,
          })
        );

        setPetDiary(data?.data);
      }

      if (!data.flag) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${data.message}`,
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
                  src={
                    petDiary?.data?.length !== 0
                      ? `http://localhost:5010${petDiary?.data[0]?.pet?.pet_Image}`
                      : SampleImage
                  }
                  alt='sample-image'
                  className='rounded-[2.6rem]'
                />
                <h2 className='text-4xl font-bold text-center mt-4 mb-1 text-white'>
                  {petDiary && petDiary?.data[0]?.pet?.pet_Name}
                </h2>
                <p className='text-lg text-center text-white'>
                  {petDiary &&
                    formatDateString(petDiary?.data[0]?.pet?.date_Of_Birth)}
                </p>
              </div>

              <button
                to={'add'}
                className='m-auto flex justify-center items-center gap-1 text-center rounded-s-full rounded-e-full bg-customPrimary text-white py-2 px-4 w-1/2 hover:opacity-90'
                onClick={() => setAddModalOpen(true)}
              >
                <AddCircleOutlineIcon /> New Post
              </button>
            </Stack>

            <Stack className='w-2/3'>
              {console.log(petDiary?.data?.length)}
              {petDiary?.data?.length !== 0 ? (
                <>
                  <PetDiaryCardList data={petDiary?.data} />
                  <div className='flex justify-center items-center gap-4 w-1/3 mx-auto mt-4'>
                    <Button
                      variant='contained'
                      onClick={handleClickPrevious}
                      disabled={pageIndex <= 1}
                      className='flex justify-center items-center gap-1'
                    >
                      <ArrowBackIosIcon fontSize='1rem' /> Previous
                    </Button>
                    <Button
                      variant='contained'
                      onClick={handleClickNext}
                      disabled={pageIndex >= petDiary?.meta?.totalPages}
                      className='flex justify-center items-center gap-1'
                    >
                      Next <ArrowForwardIosIcon fontSize='1rem' />
                    </Button>
                  </div>
                </>
              ) : (
                <p className='text-2xl font-semibold text-center'>
                  No diaries found
                </p>
              )}
            </Stack>
          </div>
        </>
      )}
      <AddDiaryModal open={addModalOpen} onClose={handleCloseAddModal} />
      <ToastContainer />
    </div>
  );
};

export default PetDiaryListPage;
