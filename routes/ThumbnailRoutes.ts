import express from "express"
import { generateThumbnail } from "../controllers/ThumbnailController.js"
import protect from "../middleware/auth.js"

const ThumbnailRouter = express.Router()

ThumbnailRouter.post("/generate", protect, generateThumbnail)

export default ThumbnailRouter
