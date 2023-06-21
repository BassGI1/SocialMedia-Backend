import UsersDAO from "../DAO/UsersDAO.js"
import PostsDAO from "../DAO/PostsDAO.js"

export default class SearchController{
    static async normalSearchWithQuery(req, res, next){
        const query = req.query.query
        const users = await UsersDAO.searchForUserByQuery(query)
        const posts = await PostsDAO.searchForPostByQuery(query)
        res.json({users: users, posts: posts})
    }
}