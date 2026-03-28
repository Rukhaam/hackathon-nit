import AdminModel from "../models/adminModel.js";
import { updateUserSuspensionStatusInDB } from "../models/adminModel.js";
export const getAllUsers = async (req, res) => {
  try {
    const users = await AdminModel.getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await AdminModel.getAllBookings();
    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error in getAllBookings controller:", error);
    res.status(500).json({ message: "Server error while fetching bookings." });
  }
};


export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_suspended } = req.body;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot suspend yourself." 
      });
    }

    await updateUserSuspensionStatusInDB(id, is_suspended);

    res.status(200).json({ 
      success: true, 
      message: `User successfully ${is_suspended ? 'suspended' : 'activated'}.` 
    });
  } catch (error) {
    next(error);
  }
};