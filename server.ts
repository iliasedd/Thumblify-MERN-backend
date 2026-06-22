import express, { Request, Response } from "express"
import session from "express-session"
import cors from "cors"
import MongoStore from "connect-mongo"
import "dotenv/config"
import connectDB from "./configs/db.js"
import AuthRouter from "./routes/AuthRoutes.js"
import ThumbnailRouter from "./routes/ThumbnailRoutes.js"
import UserRouter from "./routes/UserRoutes.js"

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean
    userId: string
  }
}

await connectDB()

const app = express()

app.use(express.json())
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
)
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI as string,
      collectionName: "sessions",
    }),
  }),
)

app.use("/api/auth", AuthRouter)
app.use("/api/thumbnails", ThumbnailRouter)
app.use("/api/users", UserRouter)

app.get("/", async (req: Request, res: Response) => {
  res.send("Server is Live !")
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
