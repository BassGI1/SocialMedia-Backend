import { ObjectId } from "mongodb"

let replies

export default class RepliesDAO{
    static async injectDB(client){
        try{
            replies = await client.db(process.env.POSTS_COLLECTION).collection("replies")
        }
        catch(e){
            console.log(e)
            process.exit(1)
        }
    }

    static async getReplies(postId, page=0){
        let paginatedReplies
        try{
            paginatedReplies = await replies.find({post: postId}).skip(page*10).limit(10).sort({numLikes: -1})
        }
        catch(e){
            console.log(e)
            return {success: false}
        }
        let cursor
        try{
            cursor = await paginatedReplies.toArray()
        }
        catch(e){
            console.log(e)
            return {success: false}
        }
        return cursor
    }

    static async createNewReply(postId, userId, text){
        let success
        try{
            success = await replies.insertOne({post: postId, by: userId, text: text, likes: [], numLikes: 0})
        }
        catch(e){
            console.log(e)
            return false
        }
        return success
    }

    static async changeLikedStatus(replyId, userId){
        let reply
        try{
            reply = await replies.findOne({_id: new ObjectId(replyId)})
        }
        catch(e){
            console.log(e)
            return false
        }
        if (reply["likes"].includes(userId)){
            try{
                await replies.updateOne({_id: new ObjectId(replyId)}, {$pull: {"likes": userId}, $set: {"numLikes": reply["numLikes"] - 1}})
            }
            catch(e){
                console.log(e)
                return false
            }
        }
        else{
            try{
                await replies.updateOne({_id: new ObjectId(replyId)}, {$push: {"likes": userId}, $set: {"numLikes": reply["numLikes"] + 1}})
            }
            catch(e){
                console.log(e)
                return false
            }
        }
        return true
    }

    static async deleteReply(replyId, userId){
        let reply
        try{
            reply = await replies.findOne({_id: new ObjectId(replyId)})
        }
        catch(e){
            console.log(e)
            return false
        }
        if (userId !== reply.by) return false
        try{
            await replies.deleteOne({_id: new ObjectId(replyId)})
        }
        catch(e){
            console.log(e)
            return false
        }
        return true
    }

    static async deleteMany(postId){
        let del
        try{
            del = await replies.deleteMany({post: postId})
        }
        catch(e){
            console.log(e)
            return false
        }
        return del.deletedCount
    }
}