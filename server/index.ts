import express from "express";
// const bodyParser = require("body-parser");
import cors from "cors";
import {
    openCloseGarage,
    isGarageOpen,
    garageStatus,
    forceCancelAutoClose
} from "./garage";
import SocketIo from "socket.io";

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(express.static("build"));
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
    res.sendFile("./build/index.html", { root: process.cwd() })
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

const io = SocketIo(
    app.listen(app.get("port"), () => {
        console.log("Express server listening on port %d", app.get("port"));
    })
);

garageStatus((status) => io.emit("garage-status", status));
io.on("connection", (socket) => {
    socket.emit("garage-status", isGarageOpen());

    socket.on("open-close", async (_, callback) => {
        await openCloseGarage();
        callback(true);
    });
    socket.on("keep-it-open", () => forceCancelAutoClose());
});
