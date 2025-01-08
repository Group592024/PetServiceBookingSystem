import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link và useNavigate
import axios from "axios";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]); // Danh sách tài khoản
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 10; // Số mục mỗi trang
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal xác nhận xóa
  const [selectedAccount, setSelectedAccount] = useState(null); // Tài khoản được chọn để xóa
  const navigate = useNavigate(); // Hook điều hướng

  // Lấy dữ liệu tài khoản từ API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Account/all"); // Thay đổi URL API
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setAccounts(response.data.data); // Lấy danh sách tài khoản từ trường 'data' trong response
        } else {
          console.error("Data is not an array:", response.data);
          setAccounts([]); // Nếu không phải mảng, gán mảng rỗng
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAccounts();
  }, []);

  // Tính toán danh sách hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = Array.isArray(accounts) ? accounts.slice(startIndex, startIndex + itemsPerPage) : [];
  const totalPages = Array.isArray(accounts) ? Math.ceil(accounts.length / itemsPerPage) : 0;

  // Chuyển trang
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Các hàm xử lý
  const handleDelete = (account) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    alert(`Account with ID: ${selectedAccount.accountId} deleted.`);
    setIsDeleteModalOpen(false);
    setAccounts((prev) => prev.filter((acc) => acc.accountId !== selectedAccount.accountId));
  };

  const cancelDelete = () => setIsDeleteModalOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-300 p-4 h-full">
        <div className="mb-6 text-center font-bold text-lg bg-gray-400 py-2 rounded">Logo</div>
        {[
          "Report",
          "Account Management",
          "Service Management",
          "Room Management",
          "Camera Management",
          "Pet Management",
          "Medicine Management",
          "Voucher Management",
        ].map((item, index) => (
          <button
            key={index}
            className={`w-full py-2 mb-2 rounded ${
              item === "Account Management" ? "bg-black text-white" : "bg-gray-400"
            }`}
          >
            {item}
          </button>
        ))}
        <button className="w-full py-2 bg-gray-500 rounded">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span>Admin</span>
            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <button className="px-4 py-2 bg-gray-300 rounded">Chat</button>
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search"
                className="w-full border rounded-full px-4 py-2 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-md rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <button className="px-4 py-2 bg-gray-300 rounded">New</button>
          </div>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Phone Number</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((account) => (
                <tr key={account.accountId} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">{account.accountId}</td>
                  <td className="border border-gray-300 px-4 py-2">{account.accountName}</td>
                  <td className="border border-gray-300 px-4 py-2">{account.accountEmail}</td>
                  <td className="border border-gray-300 px-4 py-2">{account.accountPhoneNumber}</td>
                  <td className="border border-gray-300 px-4 py-2">{account.roleId}</td>
                  <td className="border border-gray-300 px-4 py-2 flex space-x-2">
                    <Link to={`/editprofile/${account.accountId}`}>
                      <button className="px-2 py-1 bg-gray-300 rounded">Edit</button>
                    </Link>
                    <Link to={`/profile/${account.accountId}`}>
                      <button className="px-2 py-1 bg-gray-300 rounded">Detail</button>
                    </Link>
                    <button
                      className="px-2 py-1 bg-red-400 text-white rounded"
                      onClick={() => handleDelete(account)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              &lt; Previous
            </button>
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Xác nhận xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h3 className="text-lg">Are you sure you want to delete this account?</h3>
            <div className="flex space-x-4 mt-4">
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={confirmDelete}>
                Yes
              </button>
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={cancelDelete}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;
