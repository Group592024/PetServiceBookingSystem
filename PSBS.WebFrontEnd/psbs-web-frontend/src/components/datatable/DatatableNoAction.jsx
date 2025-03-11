import React from "react";
import "./style.css";
import { DataGrid } from "@mui/x-data-grid";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
const DatatableNoAction = ({
  columns,
  rows,
  title,
  rowId,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="datatable">
      <div className="datatableTitle">
        {title} List
      </div>
      <DataGrid
      
        className="datagrid"
        getRowId={(row) => row[rowId]}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
    
      />
      <ToastContainer />
    </div>
  );
};

export default DatatableNoAction;
