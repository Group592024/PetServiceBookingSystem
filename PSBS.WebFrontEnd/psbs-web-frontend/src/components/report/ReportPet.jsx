import React, { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import ReportCircleCard from "./ReportCircleCard";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/material";
import useTimeStore from "../../lib/timeStore";

const ReportPet = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const { type, year, month, startDate, endDate, changeTime } = useTimeStore();

  const [services, setServices] = useState([]);
  const [seletedService, setSeletedService] = useState(null);
  const [data, setData] = useState([]);

  const fetchDataServices = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const fetchData = await fetch(
        "http://localhost:5050/api/Service?showAll=false",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const response = await fetchData.json();

      const result = response.data.map((item) => ({
        id: item.serviceId,
        ...item,
      }));

      setServices(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataServices();
  }, []);

  const handleServiceChange = (event, newValue) => {
    setSeletedService(newValue);
  };

  const fetchDataCountPet = async () => {
    try {
      const token = sessionStorage.getItem("token");

      let url = `http://localhost:5050/api/ReportPet/${seletedService.serviceId}?`;

      if (type === "year") url += `year=${year}`;
      if (type === "month") url += `year=${year}&month=${month}`;
      if (type === "day") url += `startDate=${startDate}&endDate=${endDate}`;
      const fetchData = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!fetchData.ok) {
        setData([]);
      } else {
        const response = await fetchData.json();

        const listDictionary = response.data;

        const result = Object.entries(listDictionary).map(([key, value]) => ({
          name: key,
          quantity: value,
        }));

        setData(result);
      }

      console.log("data pet ne nhe" + data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    console.log("co goi toi pet ne");
    fetchDataCountPet();
  }, [seletedService, type, year, month, startDate, endDate]);

  return (
    <div>
      <div className="flex justify-center">
        <Autocomplete
          options={services}
          getOptionLabel={(option) => option.serviceName}
          value={seletedService}
          onChange={handleServiceChange}
          renderInput={(params) => (
            <TextField {...params} label="Select service" variant="outlined" />
          )}
          sx={{ width: "600px" }}
        />
      </div>
      <ReportCircleCard data={data} />
    </div>
  );
};

export default ReportPet;
