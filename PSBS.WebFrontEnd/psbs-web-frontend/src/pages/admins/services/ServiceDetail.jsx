import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Swal from 'sweetalert2';
import Datatable from '../../../components/services/Datatable';
import UpdateVariantModal from '../../../components/services/UpdateVariantModal';
import VariantDetailModal from '../../../components/services/VariantDetailModal';
import AddVariantModal from '../../../components/services/AddVariantModal';

const ServiceDetail = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  const [dataVariant, setDataVariant] = useState([]);
  const [idVariant, setIdVariant] = useState('');

  const [openUpdate, setOpenUpdate] = React.useState(false);
  const handleOpenUpdate = (id) => {
    setOpenUpdate(true);
    setIdVariant(id);
  };
  const handleCloseUpdate = () => setOpenUpdate(false);

  const [openDetail, setOpenDetail] = React.useState(false);
  const handleOpenDetail = (id) => {
    setOpenDetail(true);
    setIdVariant(id);
  };
  const handleCloseDetail = () => setOpenDetail(false);

  const [openAdd, setOpenAdd] = React.useState(false);
  const handleOpenAdd = () => {
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5023/api/Service/${id}`
        ).then((response) => response.json());

        const newData = {
          ...response.data,
          serviceTypeName: response.data.serviceType.typeName,
        };

        setDetail(newData);
      } catch (error) {
        console.error('Failed fetching data: ', error);
      }
    };
    if (id) {
      fetchDetail();
      fetchDataFunction();
    }
  }, [id]);

  const imageURL = `http://localhost:5023${detail.serviceImage}`;

  //api variant
  const fetchDataFunction = async () => {
    try {
      console.log('id: ', id);
      const fetchData = await fetch(`http://localhost:5023/service/${id}`);
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceVariantId,
        ...item,
      }));
      console.log(result);

      setDataVariant(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this item?',
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
              `http://localhost:5023/api/ServiceVariant/${id}`,
              {
                method: 'DELETE',
              }
            );

            if (deleteResponse.ok) {
              Swal.fire(
                'Deleted!',
                'The service variant has been deleted.',
                'success'
              );
              fetchDataFunction();
            } else if (deleteResponse.status == 409) {
              Swal.fire(
                'Error!',
                'Can not delete this service variant because it is in at least one booking.',
                'error'
              );
            } else {
              Swal.fire(
                'Error!',
                'Failed to delete the service variant',
                'error'
              );
            }
          } catch (error) {
            Swal.fire(
              'Error!',
              'Failed to delete the service variant',
              'error'
            );
          }
        };

        fetchDelete();
      }
    });
  };

  const columns = [
    {
      field: 'index',
      headerName: 'No.',
      flex: 0.5,
      // renderCell: (params) => <span>{params.rowIndex + 1}</span>,
    },
    { field: 'serviceContent', headerName: 'Service Content', flex: 2 },
    { field: 'servicePrice', headerName: 'Service Price', flex: 1 },
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
        <main className=''>
          <div className='bg-customLightPrimary text-3xl font-bold p-5 rounded-lg mb-5'>
            <div className='left flex justify-center w-full'>
              <h1 className=''>Service Detail</h1>
            </div>

            <div className='p-10  rounded-lg flex justify-between'>
              <div className='p-10 w-1/2 bg-customLight rounded-3xl'>
                <div>
                  <p className='font-semibold text-2xl '>Service Name:</p>
                  <p
                    type='text'
                    className='bg-customGrey rounded-3xl p-3 my-5 w-full shadow-lg text-xl font-semibold'
                  >
                    {detail.serviceName}
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-2xl '>Service Type</p>
                  <p
                    type='text'
                    className='bg-customGrey rounded-3xl p-3 my-5 w-full shadow-lg text-xl font-semibold'
                  >
                    {detail.serviceTypeName}
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-2xl '>Status: </p>
                  <p
                    type='text'
                    className='bg-customGrey rounded-3xl p-3 my-5 w-full shadow-lg text-xl font-semibold'
                  >
                    {detail.isDeleted ? 'Inactive' : 'Active'}
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-2xl '>
                    Service Description:{' '}
                  </p>
                  <p
                    type='text'
                    className='bg-customGrey rounded-3xl p-3 my-5 w-full shadow-lg text-xl font-semibold'
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
          </div>

          <div className='flex justify-center mt-5 mb-5'>
            <button
              onClick={() => handleOpenAdd()}
              className='bg-customPrimary py-5 px-20 rounded-3xl text-customLight text-xl font-semibold 
                    hover:bg-customLightPrimary hover:text-customPrimary'
            >
              Add variant
            </button>
          </div>

          <div className='flex justify-center my-5'>
            <Accordion sx={{ width: '100%', margin: '30px' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1-content'
                id='panel1-header'
              >
                <p className='font-semibold text-2xl '>
                  Variants of this service{' '}
                </p>
              </AccordionSummary>
              <AccordionDetails>
                <Datatable
                  columns={columns}
                  data={dataVariant}
                  pageSize={5}
                  pageSizeOptions={[5, 10, 15]}
                  onDelete={handleDelete}
                  onEdit={handleOpenUpdate}
                  onView={handleOpenDetail}
                />
                {openDetail && (
                  <VariantDetailModal
                    id={idVariant}
                    open={openDetail}
                    handleClose={handleCloseDetail}
                  />
                )}

                {openUpdate && (
                  <UpdateVariantModal
                    id={idVariant}
                    open={openUpdate}
                    handleClose={handleCloseUpdate}
                  />
                )}

                {openAdd && (
                  <AddVariantModal
                    id={id}
                    open={openAdd}
                    handleClose={setOpenAdd}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceDetail;
