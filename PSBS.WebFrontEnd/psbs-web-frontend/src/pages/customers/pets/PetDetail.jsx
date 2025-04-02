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

        const petResponse = await fetch(`http://localhost:5050/api/pet/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const petData = await petResponse.json();

        if (petData.flag) {
          setPet(petData.data);
          localStorage.setItem(
            "petInfo",
            JSON.stringify({
              petId: id,
              petName: petData.data.petName,
              petImage: petData.data.petImage,
              petDoB: petData.data.dateOfBirth,
            })
          );

          const breedResponse = await fetch(
            `http://localhost:5050/api/petBreed/${petData.data.petBreedId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
          );

          const breedData = await breedResponse.json();
          if (breedData.flag) {
            setPetBreed(breedData.data);
          }
        }
      } catch (error) {
        console.log("Lỗi khi fetch dữ liệu: ", error);
        Swal.fire("Error", "Failed to fetch data", "error");
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
            const token = sessionStorage.getItem("token");

            const deleteResponse = await fetch(
              `http://localhost:5050/api/pet/${petId}`,
              {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-gray-100'>
      <NavbarCustomer />
      <div className='container mx-auto p-6'>
        {/* Enhanced Header */}
        <div className='flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm'>
          <div className="flex items-center">
            <button onClick={() => navigate(-1)}
              className="hover:bg-indigo-100 p-3 rounded-xl transition-all">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-indigo-900 ml-6">Pet Profile</h1>
          </div>
          <button
            onClick={() => navigate('/customer/pet/add')}
            className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                             text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 
                             flex items-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z' clipRule='evenodd' />
            </svg>
            Add New Pet
          </button>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Main Content Section */}
          <div className='lg:w-3/4'>
            <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
              <div className='flex flex-col md:flex-row'>
                {/* Left Column - Image and Basic Info */}
                <div className='md:w-5/12 bg-gradient-to-b from-gray-50 to-white p-6'>
                  <div className='rounded-2xl overflow-hidden shadow-lg'>
                    <img
                      src={`http://localhost:5050/pet-service${pet.petImage}`}
                      alt={pet.petName}
                      className='w-full h-80 object-cover transform hover:scale-105 transition-transform duration-300'
                    />
                  </div>
                  <div className='text-center mt-6 space-y-4'>
                    <h1 className='text-3xl font-bold text-gray-800'>{pet.petName}</h1>
                    <div className='flex justify-center gap-4'>
                      <span className={`px-4 py-2 rounded-lg font-medium ${pet.petGender
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-pink-50 text-pink-600'
                        }`}>
                        {pet.petGender ? '♂ Male' : '♀ Female'}
                      </span>
                      <span className='px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium'>
                        {new Date(pet.dateOfBirth).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className='md:w-7/12 p-6 bg-white'>
                  <div className='space-y-6'>
                    <InfoRow
                      label='Breed'
                      value={petBreed ? petBreed.petBreedName : 'Loading...'}
                    />
                    <InfoRow
                      label='Weight'
                      value={`${pet.petWeight} kg`}
                    />
                    <InfoRow
                      label='Fur Type'
                      value={pet.petFurType}
                    />
                    <InfoRow
                      label='Fur Color'
                      value={pet.petFurColor}
                    />

                    {/* Notes Section */}
                    <div className='space-y-3'>
                      <h2 className='text-xl font-semibold text-gray-800'>Notes</h2>
                      <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                        <p className='text-gray-600'>
                          {pet.petNote || 'No additional notes provided.'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-center gap-4 pt-4'>
                      <button
                        onClick={() => navigate(`/customer/pet/edit/${pet.petId}`)}
                        className='px-4 py-2 flex items-center gap-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                      >
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pet.petId)}
                        className='px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                      >
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Buttons */}
          <div className='lg:w-1/4 flex flex-col gap-6'>
            <button
              onClick={() => navigate(`/customer/pet-diaries/${pet.petId}`)}
              className='bg-gradient-to-r from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400
                 p-8 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl
                 transform hover:-translate-y-1 group h-[250px]'
            >
              <div className='flex flex-col items-center justify-center gap-4 h-full'>
                <img
                  src={diaryicon}
                  alt='Diary Icon'
                  className='w-24 h-24 group-hover:scale-110 transition-transform'
                />
                <div className='text-center'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-2'>Pet Diary</h3>
                  <p className='text-gray-600 text-lg'>View pet's daily records</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate(`/list/${pet.petId}`)}
              className='bg-gradient-to-r from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400
                 p-8 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl
                 transform hover:-translate-y-1 group h-[250px]'
            >
              <div className='flex flex-col items-center justify-center gap-4 h-full'>
                <img
                  src={medicalhistoryicon}
                  alt='Medical Icon'
                  className='w-24 h-24 group-hover:scale-110 transition-transform'
                />
                <div className='text-center'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-2'>Medical History</h3>
                  <p className='text-gray-600 text-lg'>View health records</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced InfoRow Component
const InfoRow = ({ label, value, icon }) => (
  <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-xl'>
    <div className='flex-shrink-0'>
      {icon}
    </div>
    <div className='flex-1'>
      <span className='text-sm text-gray-500'>{label}</span>
      <div className='text-gray-800 font-medium'>{value}</div>
    </div>
  </div>
);

export default CustomerPetDetail;