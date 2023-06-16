import { MongoClient } from "mongodb"
import env from "dotenv"
import app from "./server.js";

import UsersDAO from "./DAO/UsersDAO.js";
import PostsDAO from "./DAO/PostsDAO.js";
import SuggestionBoxDAO from "./DAO/SuggestionBoxDAO.js";
import RepliesDAO from "./DAO/RepliesDAO.js";
import DMsDAO from "./DAO/DMsDAO.js";

env.config()
const port = process.env.PORT || 5000

MongoClient.connect(process.env.DB, {
    connectTimeoutMS: 5000,
    maxPoolSize: 2
}).catch(x => {
    console.log(x)
    process.exit(1)
}).then(async client => {
    UsersDAO.injectDB(client)
    PostsDAO.injectDB(client)
    SuggestionBoxDAO.injectDB(client)
    RepliesDAO.injectDB(client)
    DMsDAO.injectDB(client)
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
})