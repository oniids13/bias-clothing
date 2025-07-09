import { createUser, getUserLogin } from "../model/userQueries.js";
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

export { registerUser, loginUser };
