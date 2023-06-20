import UsersDAO from "../DAO/UsersDAO.js"
import PostsDAO from "../DAO/PostsDAO.js"
// import RepliesDAO from "../DAO/RepliesDAO.js"

export default class SearchController{
    static async normalSearchWithQuery(req, res, next){
        const query = req.query.query
        res.json(await UsersDAO.searchForUserByQuery(query))
    }
}