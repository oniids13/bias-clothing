import { createUser, getUserLogin } from "../model/userQueries.js";
import { body, validationResult } from "express-validator";
import { genPassword } from "../utils/passwordUtil.js";

const alphaErr = "must only contain letters.";
const emailErr = "must contain @ and ends with .com.";
const passLength = "must be greater than 6 characters.";

const validateUser = [
  body("fullName")
    .trim()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage(`Full name ${alphaErr}`),
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

    try {
      const { firstName, lastName, email, password } = req.body;
      const fullName = `${firstName} ${lastName}`;
      const saltHash = genPassword(password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;

      const user = await createUser(fullName, email, salt, hash);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: user,
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
    const user = await getUserLogin(email, password);

    if (user.success) {
      res.status(200).json(user);
    } else {
      res.status(401).json({
        success: false,
        message: user.message,
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
