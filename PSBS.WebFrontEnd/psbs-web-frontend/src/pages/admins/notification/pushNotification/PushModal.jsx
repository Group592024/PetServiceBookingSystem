import React, { useState, useEffect } from "react";
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
  Typography,
  Divider,
  Paper,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Close, Person, Search, CheckCircle } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { getData } from "../../../../Utilities/ApiFunctions";
const SelectReceiverModal = ({ open, onClose, onConfirm, initId }) => {
  const [receiverType, setReceiverType] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmail, setIsEmail] = useState(false); // New state for email toggle
  const [users, setUsers] = useState([]); // Renamed from setUser to setUsers for clarity

  // Fetch users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (open) {
        setIsLoading(true);
        try {
          const response = await getData("api/Account/all");
          setUsers(response.data || []); // Assuming response has data property
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsers([]); // Set empty array on error
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
  }, [open]);
  // Reset all state when modal closes
  useEffect(() => {
    if (!open) {
      setReceiverType("");
      setSelectedUsers([]);
      setSearchTerm("");
      setIsEmail(false); // Reset email toggle
    }
  }, [open]);

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
      setSelectedUsers([...users]); // Create new array to trigger state change
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
    const newSelectedUsers = selectedUsers.filter(
      (user) => user.accountId !== userId
    );
    setSelectedUsers(newSelectedUsers);

    // If all users are removed, reset receiverType to "customize" if it was a group selection
    if (newSelectedUsers.length === 0 && receiverType !== "customize") {
      setReceiverType("customize");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const selectedReceiverDTOs = selectedUsers.map((user) => ({
        UserId: user.accountId,
      }));

      const pushNotificationDTO = {
        notificationId: initId,
        Receivers: selectedReceiverDTOs,
        isEmail: isEmail, // Include the isEmail flag
      };

      await onConfirm(pushNotificationDTO); // Make sure to await the API call
      onClose();
    } catch (error) {
      console.error("Error submitting:", error);
      // Optionally show error message
    } finally {
      setIsLoading(false);
    }
  };

  // Disable confirm button when:
  // - No receiver type selected OR
  // - No users selected (regardless of mode)
  const isConfirmDisabled = !receiverType || selectedUsers.length === 0;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "500px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          outline: "none",
        }}
      >
        <Paper elevation={0} sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2" fontWeight="bold">
              Select Notification Receivers
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Email Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isEmail}
                onChange={(e) => setIsEmail(e.target.checked)}
                color="primary"
              />
            }
            label="Include Sending Email"
            sx={{ mb: 2 }}
          />

          {/* Receiver Type Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="receiverType-label">Receiver Type *</InputLabel>
            <Select
              labelId="receiverType-label"
              value={receiverType}
              onChange={handleReceiverChange}
              label="Receiver Type *"
            >
              <MenuItem value="">
                <em>Select an option</em>
              </MenuItem>
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="users">Regular Users Only</MenuItem>
              <MenuItem value="employees">Employees Only</MenuItem>
              <MenuItem value="customize">Custom Selection</MenuItem>
            </Select>
          </FormControl>

          {/* Search Input (Shown Only When Customize is Selected) */}
          {(receiverType === "customize" || selectedUsers.length > 0) && (
            <Box sx={{ mb: 3 }}>
              {receiverType === "customize" && (
                <TextField
                  label="Search by name or phone"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ color: "action.active", mr: 1 }} />
                    ),
                  }}
                />
              )}

              {/* Display Search Results */}
              {receiverType === "customize" && searchTerm && (
                <Paper
                  elevation={2}
                  sx={{ mt: 2, maxHeight: 200, overflow: "auto" }}
                >
                  <List dense>
                    {filteredUsers.map((user) => (
                      <ListItem
                        key={user.accountId}
                        button
                        onClick={() => handleUserSelect(user)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                        secondaryAction={
                          selectedUsers.some(
                            (u) => u.accountId === user.accountId
                          ) ? (
                            <CheckCircle color="success" />
                          ) : null
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.accountName}
                          secondary={user.accountPhoneNumber}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {/* Selected Users (Displayed as Chips) */}
              {selectedUsers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Selected Receivers ({selectedUsers.length})
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    {selectedUsers.map((user) => (
                      <Chip
                        key={user.accountId}
                        avatar={
                          <Avatar>
                            <Person />
                          </Avatar>
                        }
                        label={user.accountName}
                        onDelete={() => handleRemoveUser(user.accountId)}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={onClose}
              variant="outlined"
              color="inherit"
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isConfirmDisabled || isLoading}
              sx={{ px: 4 }}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isLoading ? "Processing..." : "Confirm Selection"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default SelectReceiverModal;
