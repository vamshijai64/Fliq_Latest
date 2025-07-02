const express=require('express');
const router=express.Router();
const GameController=require('../controllers/GameContorller');
const authMiddleware = require("../middlewares/authMiddleware");

router.get('/GameDashBoard',authMiddleware,GameController.getGameApiDashboard)

router.get('/GameDashBoards',authMiddleware,GameController.getGameApiDashboards)




module.exports=router;