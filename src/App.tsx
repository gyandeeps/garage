import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import SocketIo from "socket.io-client";

type Status = { isOpen: boolean; dateTime: number; isAutoCloseActive: boolean };

const App = () => {
    const socket = useRef<typeof SocketIo.Socket>();
    const [inProgress, changeProgress] = useState(false);
    const [isOpen, changeIsOpen] = useState(true);
    const [dtTime, updateDtTm] = useState("");
    const [isAutoCloseActive, changeAutoClose] = useState(false);

    const switchHandle = () => {
        changeProgress(true);
        socket.current?.emit("open-close", {}, (data: boolean) => {
            changeProgress(false);
        });
    };

    const cancelAutoClose = () => {
        socket.current?.emit("keep-it-open", {});
        changeAutoClose(false);
    };

    useEffect(() => {
        socket.current = SocketIo();

        socket.current.on(
            "garage-status",
            ({ isOpen, dateTime, isAutoCloseActive }: Status) => {
                changeIsOpen(isOpen);
                updateDtTm(
                    new Date(dateTime).toLocaleString("en-US", {
                        /// @ts-ignore
                        dateStyle: "medium",
                        timeStyle: "short"
                    })
                );
                changeAutoClose(isAutoCloseActive);
            }
        );
    }, []);

    return (
        <div className="layout">
            <div className={`status ${isOpen ? "status-open" : ""}`}>
                <label>Open: </label>
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
            {isAutoCloseActive && (
                <button className="cancel-button" onClick={cancelAutoClose}>
                    Cancel auto close
                </button>
            )}
            <div>
                Open/close time: <span>{dtTime || "--"}</span>
            </div>
        </div>
    );
};

export default App;
