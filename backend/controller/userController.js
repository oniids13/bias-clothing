import {
  createUser,
  getUserLogin,
  getUserWithAddresses,
  updateUserPhone,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../model/userQueries.js";
import { body, validationResult } from "express-validator";
import { genPassword } from "../utils/passwordUtil.js";

const alphaErr = "must only contain letters.";
const emailErr = "must contain @ and ends with .com.";
const passLength = "must be greater than 6 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage(`First name ${alphaErr}`),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage(`Last name ${alphaErr}`),
  body("email").trim().isEmail().withMessage(`Email ${emailErr}`),
  body("password")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage(`Password ${passLength}`),
];

const registerUser = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    try {
      const { firstName, lastName, email, password } = req.body;
      const fullName = `${firstName} ${lastName}`;
      const saltHash = genPassword(password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;

      const user = await createUser(fullName, email, salt, hash);

      // Log the user into the session using Passport (same as login)
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "User created but session creation failed",
            error: err.message,
          });
        }

        // Return success response with user data
        res.status(201).json({
          success: true,
          message: "User created and logged in successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
        errors,
      });
    }
  },
];

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await getUserLogin(email, password);

    if (result.success) {
      // Log the user into the session using Passport
      req.logIn(result.user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Session creation failed",
            error: err.message,
          });
        }

        // Return success response with user data
        res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            avatar: result.user.avatar,
          },
        });
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// Get user profile with addresses
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserWithAddresses(userId);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching user profile",
    });
  }
};

// Update user phone
const updateUserPhoneController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;

    const user = await updateUserPhone(userId, phone);

    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating phone:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating phone number",
    });
  }
};

// Add new address
const addAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, barangay, city, state, zipCode, country, isDefault } =
      req.body;

    // Validate required fields
    if (!street || !barangay || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "Street, barangay, city, state, and zip code are required",
      });
    }

    const address = await addAddress(userId, {
      street,
      barangay,
      city,
      state,
      zipCode,
      country: country || "Philippines",
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding address",
    });
  }
};

// Update address
const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: addressId } = req.params;
    const { street, barangay, city, state, zipCode, country, isDefault } =
      req.body;

    // Validate required fields
    if (!street || !barangay || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "Street, barangay, city, state, and zip code are required",
      });
    }

    const address = await updateAddress(addressId, userId, {
      street,
      barangay,
      city,
      state,
      zipCode,
      country: country || "Philippines",
      isDefault: isDefault || false,
    });

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating address",
    });
  }
};

// Delete address
const deleteAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: addressId } = req.params;

    const address = await deleteAddress(addressId, userId);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      address,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting address",
    });
  }
};

// Set default address
const setDefaultAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: addressId } = req.params;

    const address = await setDefaultAddress(addressId, userId);

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error setting default address",
    });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserPhoneController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
};
