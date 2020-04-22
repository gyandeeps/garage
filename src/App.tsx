import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import SocketIo from "socket.io-client";

const App = () => {
    const socket = useRef<typeof SocketIo.Socket>();
    const [inProgress, changeProgress] = useState(false);
    const [isOpen, changeIsOpen] = useState(true);

    const switchHandle = () => {
        changeProgress(true);
        socket.current?.emit("open-close", {}, (data: boolean) => {
            console.log(data);
        });
    };

    useEffect(() => {
        socket.current = SocketIo();

        socket.current.on(
            "garage-status",
            ({ isOpen }: { isOpen: boolean }) => {
                console.log(isOpen);
                changeIsOpen(isOpen);
            }
        );
    }, []);

    return (
        <div className="layout">
            <div className={`status ${isOpen ? "status-open" : ""}`}>
                <label>Garage Open: </label>
                <span id="garageStatus">{isOpen ? "Yes" : "No"}</span>
            </div>
            <button
                id="switchButton"
                className="switch-button"
                onClick={switchHandle}
                disabled={inProgress}
            >
                <img alt="Homw icon" src={logo} />
            </button>
        </div>
    );
};

export default App;
