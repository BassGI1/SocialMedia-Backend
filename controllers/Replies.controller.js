import { ObjectId } from "mongodb";

import RepliesDAO from "../DAO/RepliesDAO.js";
import UsersDAO from "../DAO/UsersDAO.js";
import PostsDAO from "../DAO/PostsDAO.js";

export default class RepliesController{
    static async createNewReply(req, res, next){
        const {postId, userId, text} = req.body
        const id = (await RepliesDAO.createNewReply(postId, userId, text)).insertedId.toString() || null
        if (!id) res.json({success: false})
       else{
            let success = await PostsDAO.addReply(postId, id)
            if (!success) res.json({success: false})
            else res.json({success: true})
       }
    }
    static async getPostReplies(req, res, next){
        const postId = req.query.postId
        const page = parseInt(req.query.page)
        let repliesData = await RepliesDAO.getReplies(postId, page)
        if (!repliesData.length) res.json([])
        let replies = []
        await repliesData.forEach(async x => {
            const username = await UsersDAO.getSingleUserGivenArbitraryNumberOfCredentials({_id: x.by})
            replies.push({
                user: username,
                likes: x.likes,
                text: x.text,
                id: x._id,
                created: new ObjectId(x._id).getTimestamp()
            })
            if (replies.length === repliesData.length) res.json(replies)
        })
    }
    static async changeLikedStatus(req, res, next){
        const {replyId, userId} = req.body
        res.json({success: await RepliesDAO.changeLikedStatus(replyId, userId)})
    }
    static async deleteReply(req, res, next){
        const {replyId, userId, postId} = req.body
        if (!replyId || !userId || !postId) res.json({success: false})
        else{
            let success = await RepliesDAO.deleteReply(replyId, userId)
            if (!success) res.json({success: success})
            else {
                success = await PostsDAO.deleteReply(postId, replyId)
                res.json({success: success})
            }
        }
    }
}