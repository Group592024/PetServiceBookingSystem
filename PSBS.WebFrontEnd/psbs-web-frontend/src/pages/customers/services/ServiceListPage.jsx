import React, { useEffect, useRef, useState } from 'react';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import { useNavigate } from 'react-router-dom';
import ServiceCardList from '../../../components/ServiceCustomer/ServiceCardList';

const ServiceListPage = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const fetchDataFunction = async () => {
    try {
      const fetchData = await fetch(
        'http://localhost:5023/api/Service?showAll=false'
      );
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setData(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);


  return (
    <div>
     <NavbarCustomer/>
     <div className='flex justify-center p-5'><p className='text-3xl font-bold'>Services For Your Pets</p></div>
     <ServiceCardList data={data}/>
    </div>
  );
};

export default ServiceListPage;
