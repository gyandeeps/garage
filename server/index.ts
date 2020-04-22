import express from "express";
// const bodyParser = require("body-parser");
import cors from "cors";
import { openCloseGarage, isGarageOpen, garageStatus } from "./garage";
import SocketIo from "socket.io";

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(express.static("public"));
// app.use(
//     bodyParser.json({
//         limit: "500kb"
//     })
// );
// app.use(bodyParser.urlencoded({ extended: true }));

app.options(
    "*",
    cors({
        optionsSuccessStatus: 200
    })
);

app.use(
    cors({
        optionsSuccessStatus: 200
    })
);

app.get("/", (req, res) =>
    res.sendFile("./public/index.html", { root: process.cwd() })
);

app.get("*", (req, res) => {
    res.status(404).send("Sorry, cant find that");
});

app.use((req, res, next) => {
    const err = new Error("Not Found");
    /// @ts-ignore
    err.status = 404;
    next(err);
});

const server = app.listen(app.get("port"), () => {
    console.log(
        "Express server listening on port %d in %s mode",
        app.get("port")
    );
});

const io = SocketIo(server);

garageStatus((status) => io.emit("garage-status", { isOpen: status }));
io.on("connection", (socket) => {
    socket.emit("garage-status", { isOpen: isGarageOpen() });

    socket.on("open-close", async (data, callback) => {
        await openCloseGarage();
        callback(true);
    });
    socket.on("is-garage-open", (data, callback) => callback(isGarageOpen()));
});
