import { create } from "zustand";

const useTimeStore = create((set) => ({
  type: "all",
  year: new Date().getFullYear(),
  month: "",
  startDate: "",
  endDate: "",
  changeTime: async (
    selectedType,
    selectedYear,
    selectedMonth,
    selectedStartDate,
    selectedEndDate
  ) => {
    set(() => ({
      type: selectedType,
      year: selectedYear,
      month: selectedMonth,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
    }));
  },
}));

export default useTimeStore;
