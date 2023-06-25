import { ObjectId } from "mongodb"
import UsersDAO from "./UsersDAO.js"
import ImagesController from "../controllers/Images.controller.js"

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

    static async searchForPostByQuery(query){
        let postsByTitle
        let postsByText
        try{
            postsByTitle = await posts.find({title: new RegExp(query, "i")})
            postsByText = await posts.find({text: new RegExp(query, "i")})
        }
        catch(e){
            console.log(e)
            return false
        }
        try{
            postsByTitle = await postsByTitle.toArray()
            postsByText = await postsByText.toArray()
        }
        catch(e){
            console.log(e)
            return false
        }
        let trueList = {}
        for (let i = 0; i < postsByTitle.length; ++i){
            if (!trueList[postsByTitle[i]._id.toString()]){
                trueList[postsByTitle[i]._id.toString()] = postsByTitle[i]
            }
        }
        for (let i = 0; i < postsByText.length; ++i){
            if (!trueList[postsByText[i]._id.toString()]){
                trueList[postsByText[i]._id.toString()] = postsByText[i]
            }
        }
        let retData = []
        for (const x of Object.values(trueList)){
            const user = await UsersDAO.getUserByID(x.by)
            retData.push({
                user: user,
                title: x.title,
                text: x.text,
                created: x.created,
                id: x._id,
                numLikes: x.likes.length,
                numReplies: x.replies.length
            })
        }
        return retData.sort((a, b) => b.numLikes - a.numLikes)
    }

    static async getFollowedPosts(id, page){
        const followedUsers = await UsersDAO.getUsersFollowed(id)
        for (let i = 0; i < followedUsers.length; ++i){
            let image = await ImagesController.getImage(followedUsers[i]._id.toString())
            followedUsers[i].image = image
        } 
        const usersObj = {}
        for (const user of followedUsers){
            if (!usersObj[user._id.toString()]) usersObj[user._id.toString()] = user
        }
        const followedUsersIds = (followedUsers || []).map(u => u._id.toString())
        if (!followedUsersIds.length) return false
        let followedposts
        try{
            followedposts = await (await posts.find({by: {$in: followedUsersIds}}).sort({_id: -1}).skip(page*10).limit(10)).toArray()
        }
        catch(e){
            console.log(e)
            return false
        }
        return {
            posts: followedposts,
            usersObj: usersObj
        }
    }

    static async getTrending(){
        let trendingPosts
        try{
            trendingPosts = await (await posts.find({created: {$gte: new Date(new Date() - 24*1000*3600), $lt: new Date()}}).limit(100)).toArray()
        }
        catch(e){
            console.log(e)
            return false
        }
        const users = await UsersDAO.getUsersFromArray(trendingPosts.map(x => new ObjectId(x.by)))
        for (let i = 0; i < users.length; ++i){
            let image = await ImagesController.getImage(users[i]._id.toString())
            users[i].image = image
        }
        return {users: users, posts: trendingPosts}
    }
}