import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams để lấy accountId từ URL

const EditProfile = () => {
  const { accountId } = useParams(); // Lấy accountId từ URL
  const navigate = useNavigate(); // Để điều hướng sau khi chỉnh sửa
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Lấy thông tin tài khoản từ API
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/Account/${accountId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch account data.");
        }
        const data = await response.json();
        setAccount(data);
        setImagePreview(data.accountImage); // Lấy ảnh đại diện ban đầu
      } catch (error) {
        console.error("Error fetching account data:", error);
        setError("Failed to load account data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [accountId]);

  // Lưu thông tin đã chỉnh sửa
  const handleSaveChanges = async () => {
    if (!account) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/Account`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes.");
      }

      alert("Profile updated successfully!");
      navigate("/accountlist"); // Quay lại danh sách tài khoản sau khi lưu
    } catch (error) {
      console.error("Error saving account data:", error);
      setError("Failed to save changes. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý thay đổi hình ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setAccount({ ...account, accountImage: file }); // Cập nhật ảnh đại diện trong account
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-300 p-4 h-full">
        <div className="mb-6 text-center font-bold text-lg bg-gray-400 py-2 rounded">Logo</div>
        <button className="w-full py-2 mb-2 bg-gray-400 rounded">Account Management</button>
        <button className="w-full py-2 mb-2 bg-gray-400 rounded">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto">
        {/* Profile Section */}
        <div className="bg-white shadow-md rounded-md p-6 flex items-start space-x-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-36 h-36 rounded-full bg-blue-200 flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-36 h-36 rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-20 h-20 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A9.003 9.003 0 0112 3v0a9.003 9.003 0 016.879 14.804M12 7v4m0 4h.01"
                  />
                </svg>
              )}
            </div>
            <input type="file" accept="image/*" className="mt-4" onChange={handleImageChange} />
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">{account.accountName}</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium">Birthday</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={account.accountDob?.split("T")[0]} // Định dạng ngày
                    onChange={(e) => setAccount({ ...account, accountDob: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Gender</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={account.accountGender || ""}
                    onChange={(e) => setAccount({ ...account, accountGender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Phone Number</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={account.accountPhoneNumber || ""}
                  onChange={(e) => setAccount({ ...account, accountPhoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Address</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={account.accountAddress || ""}
                  onChange={(e) => setAccount({ ...account, accountAddress: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Role</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={account.accountRole || ""}
                  onChange={(e) => setAccount({ ...account, accountRole: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className="px-8 py-2 bg-cyan-600 text-white rounded"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
