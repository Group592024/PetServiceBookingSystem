import React, { useRef } from "react";
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Datatable from "../../../../components/Medicines/datatable/Datatable";
import "./list.css";

const List = () => {
  const sidebarRef = useRef(null);

  return (
    <div className="list">
      <Sidebar ref={sidebarRef} />
      <div className="listContainer content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-3">
          <div className="flex justify-end items-center gap-4 mb-4">
            <form className="relative">
              <input
                type="search"
                id="search-dropdown"
                className="block w-64 p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                placeholder="Search Medicines..."
                aria-label="Search medicines"
                required
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10.5 16.5a6 6 0 100-12 6 6 0 000 12z"
                  />
                </svg>
              </button>
            </form>
            <button
              type="button"
              className="flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New
            </button>
          </div>
          <Datatable />
        </main>
      </div>
    </div>
  );
};

export default List;
