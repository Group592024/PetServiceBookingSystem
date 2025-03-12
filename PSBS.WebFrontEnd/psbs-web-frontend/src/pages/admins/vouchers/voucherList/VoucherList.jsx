import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import Datatable from "../../../../components/datatable/Datatable";
import { getData } from "../../../../Utilities/ApiFunctions";
import { Chip } from "@mui/material";
import RedeemIcon from "@mui/icons-material/Redeem";
const VoucherList = () => {
  const sidebarRef = useRef(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const data = await getData("api/Voucher");
        setRows(data.data);
      } catch (error) {
        console.error("Error fetching voucher:", error);
      }
    };
    fetchBookingStatuses();
  }, []);

  // Temporary data
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "voucherName",
      headerName: "Voucher Name",
      width: 250,
    },
    {
      field: "voucherCode",
      headerName: "Voucher Code",
      width: 200,
    },
    {
      field: "voucherQuantity",
      headerName: "Voucher Quantity",
      width: 150,
      headerAlign: "center",
      align: "center",
    },

    {
      field: "isGift",
      headerName: "Voucher Type",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.value === true) {
          return <Chip icon={<RedeemIcon />} label="Voucher" color="primary" />;
        } else {
          return <Chip label="Normal" color="warning" />;
        }
      },
    },
    {
      field: "isDeleted",
      headerName: "Status",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.value === false) {
          return <Chip label="Active" color="success" />;
        } else {
          return <Chip label="Inactive" color="error" />;
        }
      },
    },
  ];

  const basePath = "/vouchers/";
  const apiPath = "api/Voucher";
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className="listContainer">
            <Datatable
              rowId={"voucherId"}
              columns={columns}
              rows={rows}
              basePath={basePath}
              setRows={setRows}
              title="Voucher"
              apiPath={apiPath}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoucherList;
