"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multerConfig_1 = require("../config/multerConfig");
const post_controller_1 = require("../controllers/post-controller");
const router = (0, express_1.Router)();
router.post("/add-post", multerConfig_1.singlePost, post_controller_1.addPostController);
exports.default = router;
