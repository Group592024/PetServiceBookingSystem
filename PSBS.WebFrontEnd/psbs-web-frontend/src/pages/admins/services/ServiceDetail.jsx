import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import { useParams } from 'react-router-dom';

const ServiceDetail = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5023/api/Service/${id}`
        ).then((response) => response.json());
        console.log(response);

         const newData = {
           ...response.data,
           serviceTypeName: response.data.serviceType.typeName,
         };

        setDetail(newData);
      } catch (error) {
        console.error('Failed fetching data: ', error);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  

 

  console.log(detail.serviceType);

  const imageURL = `http://localhost:5023${detail.serviceImage}`;

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class='content'>
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className='header'>
            <div className='left flex justify-center w-full'>
              <h1 className=''>Service Detail</h1>
            </div>
          </div>

          <div className='p-10 bg-customLightPrimary rounded-lg flex justify-between'>
            <div className='p-10 w-1/2 bg-customLight rounded-3xl'>
              <div>
                <p className='font-semibold text-2xl '>Service Name:</p>
                <p
                  type='text'
                  className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg text-xl font-semibold'
                >
                  {detail.serviceName}
                </p>
              </div>
              <div>
                <p className='font-semibold text-2xl '>Service Type</p>
                <p
                  type='text'
                  className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg text-xl font-semibold'
                >
                  {detail.serviceTypeName}
                </p>
              </div>
              <div>
                <p className='font-semibold text-2xl '>Status: </p>
                <p
                  type='text'
                  className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg text-xl font-semibold'
                >
                  {detail.isDeleted ? 'Inactive' : 'Active'}
                </p>
              </div>
              <div>
                <p className='font-semibold text-2xl '>Service Description: </p>
                <p
                  type='text'
                  className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg text-xl font-semibold'
                >
                  {detail.serviceDescription}
                </p>
              </div>
            </div>
            <div className='w-1/2 flex justify-center items-center'>
              <img
                className='w-3/4 rounded-3xl'
                src={imageURL}
                alt={detail.serviceName}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceDetail;
