import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMedicinesList } from '../../../Utilities/ApiCalls/medicineApi';

export const medicineColumns = [
  {
    field: 'id',
    headerName: 'ID',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <div className="cellWithTable">{params.value}</div>
    ),
  },
  {
    field: 'medicineName',
    headerName: 'Name',
    flex: 3,
    headerAlign: 'center',
    renderCell: (params) => (
      <div className="cellWithTable">
        <img
          className="cellImg"
          src={params.row.medicineImg}
          alt="medicine"
        />
        {params.value}
      </div>
    ),
  },
  {
    field: 'treatmentId',
    headerName: 'Treatment',
    flex: 2,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <div className="cellWithTable">{params.value}</div>
    ),
  },
  {
    field: 'isDeleted',
    headerName: 'Active',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => {
      const isDeleted = params.row.isDeleted === 'True';
      return (
        <div
          style={{
            color: isDeleted ? 'red' : 'green',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {isDeleted ? 'Stopping' : 'Active'}
        </div>
      );
    },
  },
];

export const fetchMedicineData = async () => {
  try {
    const response = await getMedicinesList('/Medicines/all');
    const filteredData = response?.data?.map((medicine) => ({
      id: medicine.medicineId,
      treatmentId: medicine.treatmentId,
      medicineName: medicine.medicineName,
      medicineImg: medicine.medicineImage,
      isDeleted: medicine.isDeleted,
    })) || [];
    return filteredData;
  } catch (error) {
    toast.error('Something went wrong while fetching medicine data', {
      position: 'top-right',
      autoClose: 5000,
    });
    console.error('Error fetching medicine data:', error);
    return [];
  }
};
