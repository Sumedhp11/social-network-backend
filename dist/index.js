"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const morgan_1 = __importDefault(require("morgan"));
const ErrorMiddleware_js_1 = require("./middlewares/ErrorMiddleware.js");
const user_routes_js_1 = __importDefault(require("./routes/user-routes.js"));
const post_routes_js_1 = __importDefault(require("./routes/post-routes.js"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// PORT
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/user", user_routes_js_1.default);
app.use("/api/post", post_routes_js_1.default);
app.use(ErrorMiddleware_js_1.errorMiddleware);
app.listen(PORT, () => console.log(`PORT Running ON PORT ${PORT}`));
