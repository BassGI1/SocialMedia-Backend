import UsersDAO from "../DAO/UsersDAO.js";

export default class UsersController{
    static async changeUser(req, res, next){
        const user = await UsersDAO.getUserByID(req.body["_id"])
        const obj = req.body
        await UsersDAO.updateUser(obj)
        res.json({username: user["username"]})
    }

    static async changeFollowerStatus(req, res, next){
        const { followerId, followeeId } = req.body
        const success = await UsersDAO.changeFollowerStatus(followerId, followeeId)
        res.json(success)
    }

    static async getUser(req, res, next){
        const obj = req.query
        const user = await UsersDAO.getSingleUserGivenArbitraryNumberOfCredentials(obj)
        if (user) res.json({id: user["_id"], firstName: user["firstName"], lastName: user["lastName"], email: user["email"], created: user["created"], theme: user["theme"] || null, username: user["username"], success: true, followers: user["followers"]})
        else res.json({success: false})
    }
}