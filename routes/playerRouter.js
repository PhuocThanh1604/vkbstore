const express = require("express");
const bodyParser = require("body-parser");
const playerController = require("../controllers/playerController");
const multer = require("multer");
const { ensureAuthenticated, jwtAuth } = require('../config/auth');
const { requireRole } = require('../config/verifyRole');
const cloudinary = require('cloudinary').v2;
const Player = require("../model/player");

// Cấu hình kết nối với Cloudinary
cloudinary.config({
  cloud_name: 'drvrfmcji',
  api_key: '955699232226773',
  api_secret: 'Fl8t8OdH_3Lo5Ke8hj4kz1tg34g'
});

const upload = multer({
  storage: multer.diskStorage({}),
});

const playerRouter = express.Router();
playerRouter.use(bodyParser.json());

// Middleware để upload ảnh lên Cloudinary
const uploadImage = async (req, res, next) => {
  const files = req.files;
  console.log(files);
  if (files && files.length > 0) {
    try {
      const imageUrls = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );
      req.body.images = imageUrls.map((result) => result.secure_url);
    } catch (error) {
      console.error(error);
      req.flash("error_msg", "Upload failed");
      return res.redirect("/players");
    }
  }
  next();
};

playerRouter
  .route("/")
  .get(jwtAuth, requireRole, playerController.index)
  .post(jwtAuth, requireRole, upload.array("files"), uploadImage, playerController.create);

playerRouter
  .route("/edit/:playerId")
  .get(jwtAuth, requireRole, playerController.formEdit)
  .post(jwtAuth, requireRole, upload.array("files"), uploadImage, playerController.edit);

playerRouter.route("/:playerId").get(playerController.playerDetail);
playerRouter.route("/delete/:playerId").get(jwtAuth, requireRole, playerController.delete);

module.exports = playerRouter;
