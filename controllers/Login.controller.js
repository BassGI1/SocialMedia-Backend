import UsersDAO from "../DAO/UsersDAO.js";

export default class LoginController{
    static async authenticateUser(req, res, next) {
        const email = req.body.email
        const password = req.body.password
        const user = await UsersDAO.getSingleUserGivenArbitraryNumberOfCredentials({email: email, password: password})
        if (user) {
            res.json({...user, success: true})
        }
        else{
            res.json({success: false})
        }
    }
    static async createNewUser(req, res, next) {
        const email = req.body.email
        const username = req.body.username
        const password = req.body.password
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const created = req.body.created
        let user = await UsersDAO.getUser({email: email}) || await UsersDAO.getUser({username: username})
        if (!user){
            const id = await UsersDAO.createNewUser(email, username, password, firstName, lastName, created)
            res.json({success: true, email: email, password: password, _id: id, firstName: firstName, lastName: lastName, created: created, username: username})
        }
        else{
            res.json({success: false})
        }
    }
}