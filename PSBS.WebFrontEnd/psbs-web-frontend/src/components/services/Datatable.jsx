import React from "react";
import { DataGrid, gridClasses, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { styled } from "@mui/material/styles";

// Styled DataGrid with zebra striping and hover effects
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: "none",
  "& .MuiDataGrid-cell": {
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    bgColor: "black",
  },
  "& .MuiDataGrid-cell:hover": {
    color: theme.palette.primary.main,
  },
  "& .MuiDataGrid-cell MuiDataGrid-cell--textCenter": {
    display: "flex",
    alignItems: "center",
    bgColor: "black",
  },

  "& .MuiDataGrid-row:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    cursor: "pointer",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    color: theme.palette.primary.dark,
    fontWeight: "bold",
  },
  "& .MuiDataGrid-footerContainer": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiCheckbox-root": {
    color: theme.palette.primary.main,
  },
  "& .MuiTablePagination-root": {
    color: theme.palette.text.secondary,
  },
  "& .MuiDataGrid-toolbarContainer": {
    padding: theme.spacing(1),
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    "& .MuiButton-root": {
      color: theme.palette.primary.main,
    },
  },
  [`& .${gridClasses.cell}`]: {
    py: 1,
  },
}));

const Datatable = ({
  columns,
  data,
  isAdmin = true,
  pageSize = 5,
  pageSizeOptions = [5, 10, 15, 25],
  onView,
  onEdit,
  onDelete,
  title,
  showToolbar = false,
  loading = false,
  sx = {},
}) => {
  let actionsColumn;
  if (onView || onEdit || onDelete) {
    actionsColumn = {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          {onView && (
            <Tooltip title="View Details" arrow>
              <IconButton
                color="info"
                onClick={() => onView(params.row.id)}
                size="small"
                sx={{
                  boxShadow: 1,
                  "&:hover": {
                    backgroundColor: "info.lighter",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <InfoIcon data-testid="info-icon-button" fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && isAdmin && (
            <Tooltip title="Edit" arrow>
              <IconButton
                color="success"
                data-testid="edit-icon-button-variant"
                onClick={() => onEdit(params.row.id)}
                size="small"
                sx={{
                  boxShadow: 1,
                  "&:hover": {
                    backgroundColor: "success.lighter",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && isAdmin && (
            <Tooltip title="Delete" arrow>
              <IconButton
                color="error"
                onClick={() => onDelete(params.row.id)}
                size="small"
                sx={{
                  boxShadow: 1,
                  "&:hover": {
                    backgroundColor: "error.lighter",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <DeleteIcon data-testid="delete-icon-button" fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    };
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 2,
        ...sx,
      }}
    >
      {title && (
        <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
          <Typography variant="h6" component="h2" color="primary.main">
            {title}
          </Typography>
        </Box>
      )}

      <Box sx={{ height: data?.length ? "auto" : 300, width: "100%" }}>
        <StyledDataGrid
          columns={[
            ...(Array.isArray(columns) ? columns : []),
            ...(actionsColumn ? [actionsColumn] : []),
          ]}
          rows={data || []}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize,
              },
            },
          }}
          pageSizeOptions={pageSizeOptions}
          disableRowSelectionOnClick
          autoHeight={!!data?.length}
          loading={loading}
          slots={{
            toolbar: showToolbar ? GridToolbar : null,
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary" align="center">
                  No data available
                </Typography>
              </Box>
            ),
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            "& .MuiDataGrid-virtualScroller": {
              minHeight: data?.length ? "auto" : 200,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default Datatable;
