import React, { useEffect, useRef, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import ReportCircleCard from './ReportCircleCard';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';

const ReportPet = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [seletedService, setSeletedService] = useState(null);
  const [data, setData] = useState([]);

  const fetchDataServices = async () => {
    try {
      const fetchData = await fetch(
        'http://localhost:5023/api/Service?showAll=true'
      );
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setServices(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataServices();
  }, []);

  const handleServiceChange = (event, newValue) => {
    setSeletedService(newValue);
  };

  console.log(seletedService);

  const fetchDataCountPet = async () => {
    try {
      const fetchData = await fetch(
        `http://localhost:5010/api/ReportPet/${seletedService.serviceId}`
      );
      const response = await fetchData.json();

      console.log(response);

      const listDictionary = response.data;

      const result = Object.entries(listDictionary).map(([key, value]) => ({
        name: key,
        quantity: value,
      }));

      setData(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataCountPet();
  }, [seletedService]);

  console.log(data);

  return (
    <div>
      <Autocomplete
        options={services}
        getOptionLabel={(option) => option.serviceName}
        value={seletedService}
        onChange={handleServiceChange}
        renderInput={(params) => (
          <TextField {...params} label='Select service' variant='outlined' />
        )}
        sx={{ width: '600px' }}
      />
      <ReportCircleCard data={data} />
    </div>
  );
};

export default ReportPet;
