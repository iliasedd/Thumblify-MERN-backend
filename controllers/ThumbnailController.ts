import { Request, Response } from "express"
import mongoose from "mongoose"
import Thumbnail from "../models/Thumbnail.js"
import generateImage from "../configs/ai.js"

export const getThumbnails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session
    const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 })

    res.json({
      total: thumbnails.length,
      thumbnails,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid thumbnail id",
      })
    }

    const thumbnail = await Thumbnail.findOne({ userId, _id: id })

    if (!thumbnail) {
      return res.status(404).json({
        message: "Thumbnail not found",
      })
    }

    res.json({ thumbnail })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid thumbnail id",
      })
    }

    const thumbnail = await Thumbnail.findOneAndDelete({
      _id: id,
      userId,
    })

    if (!thumbnail) {
      return res.status(404).json({
        message: "Thumbnail not found",
      })
    }

    res.json({ message: "Thumbnail deleted successfully" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session
    const {
      title,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      prompt: user_prompt,
    } = req.body

    if (!title || !style) {
      return res.status(400).json({
        message: "title and style fields are required",
      })
    }

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    })

    const base64Image = await generateImage({
      aspect_ratio,
      user_prompt,
      color_scheme,
      title,
      style,
    })

    thumbnail.image = base64Image
    thumbnail.isGenerating = false
    await thumbnail.save()

    res.json({
      message: "Thumbnail Generated",
      thumbnail,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
