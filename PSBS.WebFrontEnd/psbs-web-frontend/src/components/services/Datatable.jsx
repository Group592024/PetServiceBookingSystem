import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const Datatable = ({
  columns,
  data,
  pageSize,
  pageSizeOptions,
  onView,
  onEdit,
  onDelete,
}) => {
  
  let actionsColumn;
    if (onView || onEdit || onDelete) {
       actionsColumn = {
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onView && (
              <IconButton color='primary' onClick={() => onView(params.row.id)}>
                <InfoIcon />
              </IconButton>
            )}
            {onEdit && (
              <IconButton color='success' onClick={() => onEdit(params.row.id)}>
                <EditIcon />
              </IconButton>
            )}
            {onDelete && (
              <IconButton color='error' onClick={() => onDelete(params.row.id)}>
                <DeleteIcon />
              </IconButton>
            )}
          </div>
        ),
      };
    }

  return (
    <Box sx={{ width: '100%', backgroundColor: 'white' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          columns={[...columns, actionsColumn] || []}
          rows={data || []}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize,
              },
            },
          }}
          pageSizeOptions={pageSizeOptions || [5, 10, 15]}
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
};

export default Datatable;
