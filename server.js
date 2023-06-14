import cors from "cors"
import express from "express"
import router from "./router.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api", router)
app.use('*', (req, res, next) => res.send("fuck off"))

export default app