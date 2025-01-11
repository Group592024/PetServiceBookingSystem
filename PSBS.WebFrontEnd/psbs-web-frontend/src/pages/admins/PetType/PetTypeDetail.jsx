import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import sampleImage from '../../../assets/sampleUploadImage.jpg';
import { useParams } from 'react-router-dom';

const PetTypeDetail = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5010/api/PetType/${id}`
        ).then((response) => response.json());
        console.log(response);
        setDetail(response);
      } catch (error) {
        console.error('Failed fetching data: ', error);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const imageURL = `http://localhost:5010${detail.petType_Image}`;

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class='content'>
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className='header'>
            <div className='left flex justify-center w-full'>
              <h1 className=''>Pet Type Detail</h1>
            </div>
          </div>

          <div className='p-10 bg-customLightPrimary rounded-lg flex justify-between'>
            <div className='p-10 w-1/2 bg-customLight rounded-3xl'>
              <div>
                <p className='font-semibold text-2xl '>Pet Type Name:</p>
                <p
                  type='text'
                  className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg text-xl font-semibold'
                >
                  {detail.petType_Name}
                </p>
              </div>
              <div>
                <p className='font-semibold text-2xl '>Pet Type Description:</p>
                <p
                  type='text'
                  className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg text-xl font-semibold'
                >
                  {detail.petType_Description}
                </p>
              </div>
            </div>
            <div className='w-1/2 flex justify-center items-center'>
              <img
                className='w-3/4 rounded-3xl'
                src={imageURL}
                alt={detail.petType_Name}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PetTypeDetail;
