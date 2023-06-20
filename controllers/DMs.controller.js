import DMsDAO from "../DAO/DMsDAO.js";
import UsersDAO from "../DAO/UsersDAO.js";
import ImagesController from "./Images.controller.js";

export default class DMsController{
    static async createRoom(req, res, next){
        const { userOne, userTwo } = req.body
        let room = await DMsDAO.getDMRoomFromUserIds(userOne, userTwo)
        if (room) res.json(room)
        else{
            let status = await DMsDAO.createDMRoom(userOne, userTwo)
            res.json(status)
        }
    }

    static async getRoom(req, res, next){
        res.json(await DMsDAO.getRoomById(req.query.id))
    }

    static async sendMessage(req, res, next){
        const { text, roomId, userId } = req.body
        res.json(await DMsDAO.sendMessage(roomId, userId, text))
    }

    static async getAllRoomsForUser(req, res, next){
        const userId = req.query.id
        const data = await DMsDAO.getUserRooms(userId)
        if (!data) res.json({empty: true})
        else{
            let returnData = []
            if (!data.length) res.json([])
            await data.forEach(async (room, i) => {
                let otherUserId
                if (room.userOne === userId) otherUserId = room.userTwo
                else otherUserId = room.userOne
                const otherUser = await UsersDAO.getUserByID(otherUserId)
                const otherUserImage = (await ImagesController.getImage(otherUserId)).data
                returnData.push({
                    roomId: room._id,
                    name: otherUser.name || "deleted user",
                    theme: otherUser.theme,
                    image: otherUserImage || null
                })
                if (returnData.length === data.length) res.json(returnData)
            })
        }
    }
}