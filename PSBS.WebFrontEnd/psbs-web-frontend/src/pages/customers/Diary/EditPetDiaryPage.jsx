import React, { useEffect, useRef, useState } from 'react';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import { Avatar, CircularProgress, Stack } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import sampleImage from '../../../assets/sampleUploadImage.jpg';

const EditPetDiaryPage = () => {
  const petInfo = localStorage.getItem('petInfo');

  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [petDiary, setPetDiary] = useState();

  const config = {
    readonly: false,
    placeholder: 'Start typings...',
    buttons: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'ul',
      'ol',
      '|',
      'align',
      '|',
      'link',
      'image',
    ],
    uploader: {
      insertImageAsBase64URI: true,
    },
    events: {
      error: (e) => alert('Upload failed:', e),
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/pet-diaries/${id}`
        );
        const data = await response.json();

        setContent(data?.data?.Content);
      } catch {
        setLoading(false);
        alert('Error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEditDiary = () => {
    alert(content);
  };

  return (
    <div>
      <NavbarCustomer />

      {loading ? (
        <div className='flex justify-center items-center py-12'>
          <CircularProgress />
        </div>
      ) : (
        <Stack
          spacing={2}
          className='px-8 py-12 bg-customLightPrimary w-2/3 mx-auto mt-[10%]'
        >
          <div className='flex justify-start items-center gap-4 w-full'>
            <Link to={'..'}>
              <ArrowBackIosIcon />
            </Link>

            <div className='flex justify-center items-center gap-2'>
              <Avatar
                alt={petInfo?.PetName}
                src={petInfo?.PetImage || sampleImage}
              />
              <h3 className='font-bold'>{petInfo?.PetName}</h3>
            </div>
          </div>

          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            tabIndex={1}
            onBlur={(newContent) => setContent(newContent)}
          />

          <div className='flex justify-center mt-8'>
            <button
              className='rounded-full px-8 py-4 bg-customPrimary text-customLight w-1/3'
              onClick={handleEditDiary}
            >
              Save
            </button>
          </div>
        </Stack>
      )}
    </div>
  );
};

export default EditPetDiaryPage;
