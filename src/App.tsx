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
            changeProgress(false);
        });
    };

    const cancelAutoClose = () => socket.current?.emit("keep-it-open", {});

    useEffect(() => {
        socket.current = SocketIo();

        socket.current.on(
            "garage-status",
            ({ isOpen }: { isOpen: boolean }) => {
                changeIsOpen(isOpen);
            }
        );
    }, []);

    return (
        <div className="layout">
            <div className={`status ${isOpen ? "status-open" : ""}`}>
                <label>Garage Open: </label>
                <span id="garageStatus">{isOpen ? "Yup" : "Nope"}</span>
            </div>
            <button
                id="switchButton"
                className="switch-button"
                onClick={switchHandle}
                disabled={inProgress}
            >
                <img alt="Open close garage" src={logo} />
            </button>
            {isOpen && (
                <button className="cancel-button" onClick={cancelAutoClose}>
                    Cancel auto close
                </button>
            )}
        </div>
    );
};

export default App;
