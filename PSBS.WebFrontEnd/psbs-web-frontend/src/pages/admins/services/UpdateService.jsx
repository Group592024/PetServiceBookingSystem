import React from 'react';
import { useParams } from 'react-router-dom';

const UpdateService = () => {
  const { id } = useParams();

  return <div>UpdateService {id}</div>;
};

export default UpdateService;
