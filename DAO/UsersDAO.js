import { ObjectId } from "mongodb"

import ImagesController from "../controllers/Images.controller.js"

let users

export default class UsersDAO{
    static async injectDB(client){
        try{
            users = await client.db(process.env.USERS_COLLECTION).collection("users")
        }
        catch(e){
            console.error(e)
            process.exit(1)
        }
    }

    static async getUser(obj){
        let user
        const field = Object.keys(obj)[0]
        const searchParams = {}
        searchParams[field] = {$eq: obj[field]}
        try{
            user = await users.findOne(searchParams)
        }
        catch(e){
            console.error(e)
            return false
        }
        if (user) return user
        return false
    }

    static async getUserByID(id){
        let user
        try{
            user = await users.findOne({"_id": new ObjectId(id)})
        }
        catch(e){
            console.error(e)
            return false
        }
        if (user) return user
        return false
    }

    static async createNewUser(email, username, password, firstName, lastName, created){
        let id
        try{
            id = await users.insertOne({"email": email, "password": password, "name": `${firstName} ${lastName}`, "created": created, "username": username, "followers": []})
        }
        catch(e){
            console.log(e)
            return false
        }
        return id["insertedId"].toString()
    }

    static async updateUser(obj){
        const id = obj["_id"]
        delete obj["_id"]
        const keys = Object.keys(obj)
        let updateObj = {}
        for (let i = 0; i < keys.length; ++i){
            updateObj[keys[i]] = obj[keys[i]]
        }
        let status
        try{
            status = await users.updateOne({_id: new ObjectId(id)}, {$set: updateObj})
        }
        catch(e){
            console.log(e)
            return false
        }
        return await status["matchedCount"] || false
    }

    static async changeFollowerStatus(followerId, followeeId){
        let followee
        try{
            followee = await this.getSingleUserGivenArbitraryNumberOfCredentials({"_id": followeeId})
        }
        catch(e){
            console.log(e)
            return {success: false}
        }
        let success
        if (followee["followers"].includes(followerId)){
            try{
                success = await users.updateOne({"_id": new ObjectId(followeeId)}, {$pull: {"followers": followerId}})
            }
            catch(e){
                console.log(e)
                return {success: false}
            }
        }
        else{
            try{
                success = await users.updateOne({"_id": new ObjectId(followeeId)}, {$push: {"followers": followerId}})
            }
            catch(e){
                console.log(e)
                return {success: false}
            }
        }
        return success
    }

    static async getSingleUserGivenArbitraryNumberOfCredentials(obj){
        const keys = Object.keys(obj)
        let q = {}
        let user = null
        for (let i = 0; i < keys.length; ++i){
            if (keys[i] === "_id" && obj[keys[i]].length) q[keys[i]] = new ObjectId(obj[keys[i]])
            else q[keys[i]] = {$eq: obj[keys[i]]}
        }
        try{
            user = await users.findOne(q)
        }
        catch(e){
            console.log(e)
            return false
        }
        if (user) return user
        return false
    }

    static async deleteUser(id){
        let success
        try{
            success = await users.deleteOne({_id: new ObjectId(id)})
            if (!success.deletedCount) return false
            success = await users.updateMany({followers: id}, {$pull: {followers: id}})
        }
        catch(e){
            console.log(e)
            return false
        }
        return success
    }

    static async getUsersFollowed(id){
        try{
            return await (await users.find({followers: id})).toArray()
        }
        catch(e){
            console.log(e)
            return false
        }
    }

    static async searchForUserByQuery(query){
        let usersByName
        let usersByUsername
        let usersByEmail
        try{
            usersByName = await users.find({name: new RegExp(query, "i")})
            usersByUsername = await users.find({username: new RegExp(query, "i")})
            usersByEmail = await users.find({email: new RegExp(query, "i")})
        }
        catch(e){
            console.log(e)
            return false
        }
        try{
            usersByName = await usersByName.toArray()
            usersByEmail = await usersByEmail.toArray()
            usersByUsername = await usersByUsername.toArray()
        }
        catch(e){
            console.log(e)
            return false
        }
        let trueList = {}
        for (let i = 0; i < usersByEmail.length; ++i){
            if (!trueList[usersByEmail[i]._id.toString()]){
                trueList[usersByEmail[i]._id.toString()] = usersByEmail[i]
            }
        }
        for (let i = 0; i < usersByUsername.length; ++i){
            if (!trueList[usersByUsername[i]._id.toString()]){
                trueList[usersByUsername[i]._id.toString()] = usersByUsername[i]
            }
        }
        for (let i = 0; i < usersByName.length; ++i){
            if (!trueList[usersByName[i]._id.toString()]){
                trueList[usersByName[i]._id.toString()] = usersByName[i]
            }
        }
        let retData = []
        for (const x of Object.values(trueList)){
            let image = await ImagesController.getImage(x._id.toString())
            retData.push({
                id: x._id.toString(),
                image: image || null,
                name: x.name,
                theme: x.theme || null,
                username: x.username,
                created: x.created,
                numFollowers: x.followers.length
            })
        }
        return retData.sort((a, b) => b.numFollowers - a.numFollowers)
    }
}