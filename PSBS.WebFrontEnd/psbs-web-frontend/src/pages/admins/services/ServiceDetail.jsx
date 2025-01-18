import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

const ServiceDetail = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  const [dataVariant, setDataVariant] = useState([]);

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

  //api variant
  // const fetchDataFunction = async () => {
  //   try {
  //     const fetchData = await fetch(
  //       'http://localhost:5023/api/Service?showAll=true'
  //     );
  //     const response = await fetchData.json();

  //     const result = response.data.map((item) => ({
  //       id: item.serviceId,
  //       ...item,
  //     }));

  //     setData(result);
  //   } catch (error) {
  //     console.error('Error fetching data: ', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchDataFunction();
  // }, []);

  // const handleDelete = (id) => {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: 'Do you want to delete this item?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Delete',
  //     cancelButtonText: 'Cancel',
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const fetchDelete = async () => {
  //         try {
  //           const deleteResponse = await fetch(
  //             `http://localhost:5023/api/Service/${id}`,
  //             {
  //               method: 'DELETE',
  //             }
  //           );

  //           console.log(deleteResponse);

  //           if (deleteResponse.ok) {
  //             Swal.fire('Deleted!', 'The service has been deleted.', 'success');
  //             fetchDataFunction();
  //           } else if (deleteResponse.status == 409) {
  //             Swal.fire(
  //               'Error!',
  //               'Can not delete this service because it has service variant',
  //               'error'
  //             );
  //           } else {
  //             Swal.fire('Error!', 'Failed to delete the service', 'error');
  //           }
  //         } catch (error) {
  //           console.log(error);
  //           Swal.fire('Error!', 'Failed to delete the service', 'error');
  //         }
  //       };

  //       fetchDelete();
  //     }
  //   });
  // };

  // const newRows = data.map((row, index) => ({
  //   index: index + 1,
  //   serviceTypeName: row.serviceType.typeName,
  //   ...row,
  // }));

  const columns = [
    {
      field: 'index',
      headerName: 'No.',
      flex: 0.5,
      // renderCell: (params) => <span>{params.rowIndex + 1}</span>,
    },
    { field: 'serviceName', headerName: 'Service Name', flex: 1 },
    { field: 'serviceTypeName', headerName: 'Service Type', flex: 2 },
    {
      field: 'isDeleted',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.isDeleted ? 'Inactive' : 'Active'}</span>
      ),
    },
  ];

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

              <div className='m-5'>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1-content'
                    id='panel1-header'
                  >
                    <p className='font-semibold text-2xl '>
                      View variants of this service{' '}
                    </p>
                  </AccordionSummary>
                  <AccordionDetails>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                  </AccordionDetails>
                </Accordion>
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
