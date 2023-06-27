import cors from "cors"
import express from "express"
import router from "./router.js"

const app = express()

app.use(cors({
    origin: "https://ykqqpydbmi4vcotcg1cbx6oqahs43q.netlify.app/"
}))
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use("/api", router)

export default app