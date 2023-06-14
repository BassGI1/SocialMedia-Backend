import { ObjectId } from "mongodb"

let posts

export default class PostsDAO{
    static async injectDB(client){
        try{
            posts = await client.db(process.env.POSTS_COLLECTION).collection("posts")
        }
        catch(e){
            console.error(e)
        }
    }

    static async getSinglePostByArbitraryNumberOfParameters(obj){
        let post
        if (obj["id"]){
            try{
                post = await posts.findOne({"_id": new ObjectId(obj["id"])})
            }
            catch(e){
                console.log(e)
                return false
            }
        }
        else{
            const keys = Object.keys(obj)
            let q = {}
            for (let i = 0; i < keys.length; ++i){
                q[keys[i]] = {$eq: obj[keys[i]]}
            }
            try{
                post = await posts.findOne(q)
            }
            catch(e){
                console.log(e)
                return false
            }
        }
        return post
    }

    static async getPostsByUser(id, page){
        let userPosts
        try{
            userPosts = await posts.find({"by": {$eq: id}}).sort({"created": -1}).skip(page*10).limit(10)
        }
        catch(e){
            console.log(e)
            return {success: false}
        }
        let cursor = await userPosts.toArray()
        if (cursor.length) return cursor
        return ["empty"]
    }

    static async createPost(id, title, text){
        let success
        try{
            success = await posts.insertOne({"by": id, "title": title, "text": text, "created": new Date(), "likes": [], "replies": []})
        }
        catch(e){
            console.log(e)
            return {success: false}
        }
        if (success["insertedId"]) return {_id: success["insertedId"], success: true}
        return {success: false}
    }

    static async changeLikedStatus(userId, id){
        let post = await this.getSinglePostByArbitraryNumberOfParameters({"id": id})
        if (!post) return false
        let success
        if (post["likes"].includes(userId)){
            try{
                success = await posts.updateOne({"_id": new ObjectId(id)}, {$pull: {"likes": userId}})
            }
            catch(e){
                console.log(e)
                return false
            }
        }
        else{
            try{
                success = await posts.updateOne({"_id": new ObjectId(id)}, {$push: {"likes": userId}})
            }
            catch(e){
                console.log(e)
                return false
            }
            
        }
        return success
    }

    static async addReply(postId, replyId){
        try{
            await posts.updateOne({"_id": new ObjectId(postId)}, {$push: {"replies": replyId}})
        }
        catch(e){
            console.log(e)
            return false
        }
        return true
    }

    static async deleteReply(postId, replyId){
        try{
            await posts.updateOne({_id: new ObjectId(postId)}, {$pull: {"replies": replyId}})
        }
        catch(e){
            console.log(e)
            return false
        }
        return true
    }

    static async deletePost(postId){
        try{
            await posts.deleteOne({_id: new ObjectId(postId)})
        }
        catch(e){
            console.log(e)
            return false
        }
        return true
    }
}