import { Router } from "express";

import LoginController from "./controllers/Login.controller.js";
import MusicController from "./controllers/Music.controller.js";
import UsersController from "./controllers/Users.controller.js";
import PostsController from "./controllers/Posts.controller.js";
import RepliesController from "./controllers/Replies.controller.js";
import DMsController from "./controllers/DMs.controller.js";
import ImagesController from "./controllers/Images.controller.js";
import SearchController from "./controllers/Search.controller.js";

import SuggestionBoxDAO from "./DAO/SuggestionBoxDAO.js";

const router = Router()


// Sign In Routes
router.route("/login")
.post((req, res, next) => LoginController.authenticateUser(req, res, next))

router.route("/signup")
.post((req, res, next) => LoginController.createNewUser(req, res, next))


// Music Routes
router.route("/searchfortrack")
.get((req, res, next) => MusicController.getTracks(req, res, next))


// Editing Users Routes
router.route("/changemusic")
.post((req, res, next) => UsersController.changeUser(req, res, next))

router.route("/edituser")
.post((req, res, next) => UsersController.changeUser(req, res, next))

router.route("/changefollowstatus")
.post((req, res, next) => UsersController.changeFollowerStatus(req, res, next))

router.route("/deleteuser")
.post((req, res, next) => UsersController.deleteUser(req, res, next))


// Getting a Profile Routes
router.route("/getuser")
.get((req, res, next) => UsersController.getUser(req, res, next))


// Posts Routes
router.route("/userposts")
.get((req, res, next) => PostsController.getPostsFromUserID(req, res, next))
.post((req, res, next) => PostsController.createNewPost(req, res, next))

router.route("/getpost")
.get((req, res, next) => PostsController.getPost(req, res, next))

router.route("/changelikestatus")
.post((req, res, next) => PostsController.changeLikeStatus(req, res, next))

router.route("/deletepost")
.post((req, res, next) => PostsController.deletePost(req, res, next))


// Suggestion Box Routes
router.route("/suggest")
.post(async (req, res, next) => res.json(await SuggestionBoxDAO.addSuggestion(req.body.id, req.body.text)))


// Replies Routes
router.route("/createreply")
.post((req, res, next) => RepliesController.createNewReply(req, res, next))

router.route("/getreplies")
.get((req, res, next) => RepliesController.getPostReplies(req, res, next))

router.route("/likereply")
.post((req, res, next) => RepliesController.changeLikedStatus(req, res, next))

router.route("/deletereply")
.post((req, res, next) => RepliesController.deleteReply(req, res, next))


// DM Routes
router.route("/createroom")
.post((req, res, next) => DMsController.createRoom(req, res, next))

router.route("/getroom")
.get((req, res, next) => DMsController.getRoom(req, res, next))

router.route("/sendmessage")
.post((req, res, next) => DMsController.sendMessage(req, res, next))

router.route("/getallroomsforuser")
.get((req, res, next) => DMsController.getAllRoomsForUser(req, res, next))


// Images Routes
router.route("/image")
.get(async (req, res, next) => res.json(await ImagesController.getImage(req.query.id)))
.post(async (req, res, next) => {
    const { id, imageString } = req.body
    res.json({data: await ImagesController.putImage(id, imageString)})
})


// Searching Routes
router.route("/search")
.get((req, res, next) => SearchController.normalSearchWithQuery(req, res, next))

export default router