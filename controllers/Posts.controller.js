import PostsDAO from "../DAO/PostsDAO.js";
import RepliesDAO from "../DAO/RepliesDAO.js";

export default class PostsController{
    static async getPostsFromUserID(req, res, next){
        const id = req.query.id
        const page = parseInt(req.query.page)
        let posts = await PostsDAO.getPostsByUser(id, page)
        res.json(posts)
    }

    static async createNewPost(req, res, next){
        const {id, title, text} = req.body
        let success = await PostsDAO.createPost(id, title, text)
        res.json(success)
    }

    static async changeLikeStatus(req, res, next){
        const {userId, id} = req.body
        let success = await PostsDAO.changeLikedStatus(userId, id)
        if (success["modifiedCount"]) res.json({success: true})
        else res.json({success: false})
    }

    static async getPost(req, res, next){
        const id = req.query.id
        let post = await PostsDAO.getSinglePostByArbitraryNumberOfParameters({"id": id})
        if (post) res.json(post)
        else res.json({success: false})
    }

    static async deletePost(req, res, next){
        const { postId } = req.body
        let success = await PostsDAO.deletePost(postId)
        if (!success) res.json({success: false})
        else{
            success = await RepliesDAO.deleteMany(postId)
            res.json({success: success})
        }
    }
}