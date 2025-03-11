import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';
import diaryicon from '../../../assets/diaryicon.png';
import medicalhistoryicon from '../../../assets/health-checkicon.png';

const CustomerPetDetail = () => {
  const [pet, setPet] = useState(null);
  const [petBreed, setPetBreed] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
   
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const petResponse = await fetch(`http://localhost:5050/api/pet/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const petData = await petResponse.json();

        if (petData.flag) {
          setPet(petData.data);
          localStorage.setItem(
            'petInfo',
            JSON.stringify({
              petId: id,
              petName: petData.data.petName,
              petImage: petData.data.petImage,
              petDoB: petData.data.dateOfBirth,
            })
          );
          const breedResponse = await fetch(
            `http://localhost:5050/api/petBreed/${petData.data.petBreedId}`
          );
          const breedData = await breedResponse.json();
          if (breedData.flag) {
            setPetBreed(breedData.data);
          }
        }
      } catch (error) {
        console.log("loi nha: ",error);
        Swal.fire('Error', 'Failed to fetch data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = (petId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this pet? This action may affect related data in the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        const fetchDelete = async () => {
          try {
            const deleteResponse = await fetch(
              `http://localhost:5050/api/pet/${petId}`,
              {
                method: 'DELETE',
              }
            );

            if (!deleteResponse.ok) {
              let errorMessage = 'Failed to delete the pet.';
              try {
                const errorData = await deleteResponse.json();
                errorMessage = errorData.message || errorMessage;
              } catch (jsonError) {
                console.error('Error parsing error response:', jsonError);
              }
              Swal.fire('Error!', errorMessage, 'error');
              return;
            }

            Swal.fire('Deleted!', 'The pet has been deleted.', 'success').then(
              () => {
                navigate('/customer/pet');
              }
            );
          } catch (error) {
            console.error('Error deleting pet:', error);
            Swal.fire('Error!', 'Failed to delete the pet.', 'error');
          }
        };

        fetchDelete();
      }
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div role='status'>
          <svg
            aria-hidden='true'
            className='inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
              fill='currentColor'
            />
            <path
              d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
              fill='currentFill'
            />
          </svg>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className='bg-white min-h-screen'>
      <NavbarCustomer />
      <div className='mx-auto p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-800'>Pet Details</h1>
          <button
            onClick={() => navigate('/customer/pet/add')}
            className='bg-blue-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                clipRule='evenodd'
              />
            </svg>
            Add New Pet
          </button>
        </div>

        <div className='flex gap-8'>
          {/* Form Section */}
          <div className='w-3/4'>
            <div className='bg-gray-300 rounded-xl p-8 shadow-lg'>
              <div className='flex flex-col md:flex-row gap-16'>
                {/* Left side - Image and Name */}
                <div className='md:w-5/12 flex flex-col items-center'>
                  <div className='bg-gray-100 p-4 rounded-xl shadow-md w-full'>
                    <img
                      src={`http://localhost:5050/pet-service${pet.petImage}`}
                      alt={pet.petName}
                      className='w-full h-80 object-cover rounded-lg'
                    />
                  </div>
                  <h1 className='text-4xl font-bold text-gray-800 my-4'>
                    {pet.petName}
                  </h1>
                  <div className='text-center space-y-2'>
                    <div className='text-xl font-semibold text-gray-600'>
                      {pet.petGender ? 'Male' : 'Female'}
                    </div>
                    <div className='text-xl font-semibold text-gray-600'>
                      {new Date(pet.dateOfBirth).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>

                {/* Right side - Form */}
                <div className='md:w-6/12'>
                  <div className='space-y-4'>
                    <InfoRow
                      label='Breed'
                      value={petBreed ? petBreed.petBreedName : 'Loading...'}
                      isFirst={true}
                    />
                    <InfoRow label='Weight' value={`${pet.petWeight} kg`} />
                    <InfoRow label='Fur Type' value={pet.petFurType} />
                    <InfoRow label='Fur Color' value={pet.petFurColor} />
                  </div>
                  <div className='mt-8'>
                    <h2 className='font-bold text-gray-800 text-2xl mb-4'>
                      Notes
                    </h2>
                    <div className='bg-gray-200 p-4 rounded-lg text-gray-700 text-lg border border-gray-300 shadow-sm max-h-60 overflow-auto break-words'>
                      {pet.petNote || 'No additional notes provided.'}
                    </div>
                    {/* Buttons */}
                    <div className='flex justify-center gap-8 mt-6'>
                      <button
                        onClick={() =>
                          navigate(`/customer/pet/edit/${pet.petId}`)
                        }
                        className='p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow transition'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
                          <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(pet.petId)}
                        className='p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow transition'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='24'
                          height='24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path d='M3 6h18'></path>
                          <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className='w-1/4 flex flex-col gap-6'>
            <button
              onClick={() => navigate(`/customer/pet-diaries/${pet.petId}`)}
              className='bg-[#f9e79f] text-black text-lg font-semibold px-12 py-16 rounded-lg hover:bg-[#f1d37b] shadow-lg transition flex items-center gap-6'
            >
              <img src={diaryicon} alt='Diary Icon' className='w-24 h-24' />
              <span className='text-xl'>Pet Diary</span>
            </button>
            <button
              onClick={() =>
                navigate(`/list/${pet.petId}`)
              }
              className='bg-[#d1c4e9] text-black text-lg font-semibold px-12 py-16 rounded-lg hover:bg-[#b39ddb] shadow-lg transition flex items-center gap-6'
            >
              <img
                src={medicalhistoryicon}
                alt='Medical Icon'
                className='w-24 h-24'
              />
              <span className='text-xl'>Pet Medical History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className='flex justify-between items-center py-4 border-b border-black border-opacity-10'>
    <span className='font-semibold text-gray-800 text-xl'>{label}</span>
    <span className='text-gray-600 text-lg'>{value}</span>
  </div>
);

export default CustomerPetDetail;
