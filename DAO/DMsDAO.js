import { ObjectId } from "mongodb"

let DMs

class message{
    constructor(message, user){
        this.message = message
        this.userId = user
        this.created = new Date()
    }
}

export default class DMsDAO{
    static async injectDB(client){
        try{
            DMs = await client.db(process.env.DMS_COLLECTION).collection("direct messages")
        }
        catch(e){
            console.log(e)
            process.exit(1)
        }
    }

    static async createDMRoom(userOne, userTwo){
        let status
        try{
            status = await DMs.insertOne({
                userOne: userOne,
                userTwo: userTwo,
                messages: [],
                timeInteraction: new Date()
            })
        }
        catch(e){
            console.log(e)
            return false
        }
        return status
    }

    static async getDMRoomFromUserIds(userOne, userTwo){
        let room
        try{
            room = await DMs.findOne({userOne: userOne, userTwo: userTwo})
        }
        catch(e){
            console.log(e)
            return false
        }
        if (room) return room
        try{
            room = await DMs.findOne({userTwo: userOne, userOne: userTwo})
        }
        catch(e){
            console.log(e)
            return false
        }
        return room
    }

    static async getRoomById(id){
        try{
            return await DMs.findOne({_id: new ObjectId(id)})
        }
        catch(e){
            console.log(e)
            return false
        }
        return false
    }

    static async sendMessage(roomId, userId, text){
        const m = new message(text, userId)
        try{
            return await DMs.updateOne({_id: new ObjectId(roomId)}, {$push: {messages: m}, $set: {timeInteraction: new Date()}})
        }
        catch(e){
            console.log(e)
            return false
        }
        return false
    }

    static async getUserRooms(userId){
        let halfOne = []
        let halfTwo = []
        try{
            halfOne = await (await DMs.find({"userOne": userId})).toArray()
            halfTwo = await (await DMs.find({"userTwo": userId})).toArray()
        }
        catch(e){
            console.log(e)
            return false
        }
        return [...halfOne, ...halfTwo].sort((b, a) => a.timeInteraction - b.timeInteraction)
    }
}