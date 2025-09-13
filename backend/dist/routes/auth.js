"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
// Sign up
router.post('/signup', (req, res) => authController.signup(req, res));
// Sign in
router.post('/signin', (req, res) => authController.signin(req, res));
exports.default = router;
//# sourceMappingURL=auth.js.map