import { Router } from "express";

import LoginController from "./controllers/Login.controller.js";
import MusicController from "./controllers/Music.controller.js";
import UsersController from "./controllers/Users.controller.js";
import PostsController from "./controllers/Posts.controller.js";
import RepliesController from "./controllers/Replies.controller.js";

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


export default router