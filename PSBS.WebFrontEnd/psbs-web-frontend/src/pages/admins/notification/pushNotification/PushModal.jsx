import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const SelectReceiverModal = ({ open, onClose, onConfirm, initId }) => {
  const [receiverType, setReceiverType] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary user data
  const users = [
    {
      accountId: "e7a5df67-508a-469a-9641-3ac1be3096b4",
      accountName: "binhtt",
      accountPhoneNumber: "0355231547",
      roleId: "user",
    },
    {
      accountId: "e1e53bce-0c16-4311-af5d-8d6a4b73b4e2",
      accountName: "Cao My Le",
      accountPhoneNumber: "0332213433",
      roleId: "user",
    },
    {
      accountId: "224e8845-9fa0-4cc0-bcb3-958eefd2e667",
      accountName: "ドラえもん",
      accountPhoneNumber: "0323321343",
      roleId: "admin",
    },
  ];

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      user.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accountPhoneNumber.includes(searchTerm)
  );

  // Handle receiver type selection
  const handleReceiverChange = (event) => {
    const value = event.target.value;
    setReceiverType(value);
    if (value === "all") {
      setSelectedUsers([]);
    } else if (value === "users") {
      setSelectedUsers(users.filter((user) => user.roleId === "user"));
    } else if (value === "employees") {
      setSelectedUsers(users.filter((user) => user.roleId !== "user"));
    } else {
      setSelectedUsers([]); // Reset for "customize"
    }
  };

  // Handle user selection in customize mode
  const handleUserSelect = (user) => {
    if (!selectedUsers.some((u) => u.accountId === user.accountId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Remove a selected user
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.accountId !== userId));
  };

  const handleSubmit = () => {
    const selectedReceiverDTOs = selectedUsers.map((user) => ({
      UserId: user.accountId,
    }));

    const pushNotificationDTO = {
      notificationId: initId, // Using initId as notificationId
      Receivers: selectedReceiverDTOs,
    };

    onConfirm(pushNotificationDTO);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <Box className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Select Receivers</h2>

        {/* Receiver Type Selection */}
        <FormControl fullWidth>
          <InputLabel id="receiverType-label">Receiver Type</InputLabel>
          <Select
            labelId="receiverType-label"
            value={receiverType}
            onChange={handleReceiverChange}
            label="Receiver Type"
            className="!text-black"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="users">Users</MenuItem>
            <MenuItem value="employees">Employees</MenuItem>
            <MenuItem value="customize">Customize</MenuItem>
          </Select>
        </FormControl>

        {/* Search Input (Shown Only When Customize is Selected) */}
        {receiverType === "customize" && (
          <div className="mt-4">
            <TextField
              label="Search by Name or Phone"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!text-black"
            />
            {/* Display Search Results */}
            {searchTerm && (
              <div className="mt-2 max-h-32 overflow-y-auto bg-gray-100 p-2 rounded">
                {filteredUsers.map((user) => (
                  <div
                    key={user.accountId}
                    className="flex justify-between p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <span>
                      {user.accountName} ({user.accountPhoneNumber})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Users (Displayed as Chips) */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Chip
                key={user.accountId}
                label={user.accountName}
                onDelete={() => handleRemoveUser(user.accountId)}
                className="!text-black"
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <Button onClick={onClose}>Back</Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Confirm
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default SelectReceiverModal;
