import DMsDAO from "../DAO/DMsDAO.js";

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
}