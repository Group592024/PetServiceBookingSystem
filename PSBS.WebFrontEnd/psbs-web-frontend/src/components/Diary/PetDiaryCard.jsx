import { Avatar, IconButton } from '@mui/material';
import React from 'react';
import sampleImage from '../../assets/sampleUploadImage.jpg';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDateString } from '../../Utilities/formatDate';

const PetDiaryCard = ({ petDiary, onEdit, onDelete }) => {
  return (
    <div className='bg-customLightPrimary p-6 my-4 rounded-2xl'>
      <div className='flex justify-between items-center'>
        <div className='flex justify-center items-center gap-3'>
          <Avatar
            alt={petDiary?.pet?.pet_Name}
            src={petDiary?.pet?.pet_Image || sampleImage}
          />
          <h3 className='font-bold text-lg'>{petDiary?.pet?.pet_Name}</h3>
        </div>

        <div className='flex justify-between items-center'>
          <span className='italic me-4'>
            {formatDateString(petDiary?.diary_Date)}
          </span>
          <IconButton aria-label='edit' onClick={onEdit} color='info'>
            <EditIcon />
          </IconButton>

          <IconButton aria-label='delete' onClick={onDelete} color='error'>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: petDiary?.diary_Content }}
        className='mt-6'
      ></div>
    </div>
  );
};

export default PetDiaryCard;
