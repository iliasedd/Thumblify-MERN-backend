import express from "express"
import {
  deleteThumbnail,
  generateThumbnail,
  getThumbnailById,
  getThumbnails,
} from "../controllers/ThumbnailController.js"
import protect from "../middleware/auth.js"

const ThumbnailRouter = express.Router()

ThumbnailRouter.get("/", protect, getThumbnails)
ThumbnailRouter.get("/:id", protect, getThumbnailById)
ThumbnailRouter.post("/generate", protect, generateThumbnail)
ThumbnailRouter.delete("/:id", protect, deleteThumbnail)

export default ThumbnailRouter
