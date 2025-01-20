import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import VariantCard from '../../admins/services/VariantCard';

const ServiceDetailPage = () => {
  const sidebarRef = useRef(null);

  const [detail, setDetail] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  const [dataVariant, setDataVariant] = useState([]);
  const [idVariant, setIdVariant] = useState('');

  const [openDetail, setOpenDetail] = React.useState(false);
  const handleOpenDetail = (id) => {
    setOpenDetail(true);
    setIdVariant(id);
  };
  const handleCloseDetail = () => setOpenDetail(false);

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

  return (
    <div>
      <NavbarCustomer />
      <div>
        <div className='p-10 mx-20 flex justify-start items-start'>
          <div className='p-10 w-1/2 flex justify-center'>
            <img
              className='rounded-3xl w-4/5 object-cover'
              src={imageURL}
              alt={detail.serviceName}
            />
          </div>
          <div className='w-1/2 p-10'>
            <p className='text-5xl font-bold p-5'>{detail.serviceName}</p>
            <p className='text-3xl font-bold p-5 text-customPrimary italic'>
              {detail.serviceTypeName} Service
            </p>
            <div className='flex justify-start items-center'>
              {dataVariant.map((item) => (
                <VariantCard key={item.serviceVariantId} data={item} />
              ))}
            </div>
            <div className=''>
              <button
                className='mt-5 bg-customDanger p-3 w-2/3 rounded-3xl text-customLight text-xl font-semibold 
                      hover:bg-customLight hover:text-customDark text-center'
              >
                Booking Now
              </button>
            </div>
          </div>
        </div>
        <div className='p-5 bg-customDarkGrey rounded-3xl mx-28'>
          <p className='text-3xl font-bold p-5'>Service Description</p>
          <div className='p-5 bg-customGrey rounded-3xl text-xl'>
            <p>{detail.serviceDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
