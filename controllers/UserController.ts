import { Request, Response } from "express"
import mongoose from "mongoose"
import User from "../models/User.js"

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    res.json({
      total: users.length,
      users,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      })
    }

    const user = await User.findOne({ _id: id }).select("-password")

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      })
    }

    res.json({ user })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user id",
      })
    }

    const user = await User.findOneAndDelete({
      _id: id,
    })

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      })
    }

    // if user is logged in, destroy session
    if (id == userId) {
      req.session.destroy((error: any) => {
        if (error) {
          console.log(error)
          return res.status(500).json({ message: error.message })
        }
      })
    }

    res.json({ message: "user deleted successfully" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
