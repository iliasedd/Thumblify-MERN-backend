import express from "express"
import {
  deleteUser,
  getUserById,
  getUsers,
} from "../controllers/UserController.js"

const UserRouter = express.Router()

UserRouter.get("/", getUsers)
UserRouter.get("/:id", getUserById)
UserRouter.delete("/:id", deleteUser)

export default UserRouter
