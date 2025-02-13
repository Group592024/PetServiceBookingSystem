// import React, { useRef, useState } from 'react';
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
// import { Link } from 'react-router-dom';
// import { Avatar, Stack } from '@mui/material';
// import sampleImage from '../../../assets/sampleUploadImage.jpg';
// import JoditEditor from 'jodit-react';

// const AddPetDiaryPage = () => {
//   const editor = useRef(null);
//   const [content, setContent] = useState('');

//   const config = {
//     readonly: false,
//     placeholder: 'Start typings...',
//     buttons: [
//       'bold',
//       'italic',
//       'underline',
//       'strikethrough',
//       '|',
//       'ul',
//       'ol',
//       '|',
//       'align',
//       '|',
//       'link',
//       'image',
//     ],
//     uploader: {
//       insertImageAsBase64URI: true,
//     },
//     events: {
//       error: (e) => alert('Upload failed:', e),
//     },
//   };

//   const handleCreateDiary = () => {
//     alert(content);
//   };

//   return (
//     <div>
//       <NavbarCustomer />

//       <Stack
//         spacing={2}
//         className='px-8 py-12 bg-customLightPrimary w-2/3 mx-auto mt-[10%]'
//       >
//         <div className='flex justify-start items-center gap-4 w-full'>
//           <Link to={'..'}>
//             <ArrowBackIosIcon />
//           </Link>

//           <div className='flex justify-center items-center gap-2'>
//             <Avatar
//               alt={petInfo?.PetName}
//               src={petInfo?.PetImage || sampleImage}
//             />
//             <h3 className='font-bold'>{petInfo?.PetName}</h3>
//           </div>
//         </div>

//         <JoditEditor
//           ref={editor}
//           value={content}
//           config={config}
//           tabIndex={1}
//           onBlur={(newContent) => setContent(newContent)}
//         />

//         <div className='flex justify-center mt-8'>
//           <button
//             className='rounded-full px-8 py-4 bg-customPrimary text-customLight w-1/3'
//             onClick={() => handleCreateDiary(petInfo?.petId)}
//           >
//             Save
//           </button>
//         </div>
//       </Stack>
//     </div>
//   );
// };

// export default AddPetDiaryPage;
