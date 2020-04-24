import { Gpio } from "onoff";

let garageAutoCloseInterval: NodeJS.Timeout | null = null;
let openCloseDtTm = Date.now();
const buttonTrigger = new Gpio(4, "out", undefined, {
    reconfigureDirection: false
});
const doorSensor = new Gpio(2, "in", "both", {
    reconfigureDirection: false,
    debounceTimeout: 1000
});

type Status = { isOpen: boolean; dateTime: number; isAutoCloseActive: boolean };

type Callback = (obj: Status) => void;
const garageStatusSubscribers = new Set<Callback>();

doorSensor.watch((err, value) => {
    if (err) console.error(err);

    const isOpen = !Boolean(value);
    openCloseDtTm = Date.now();

    if (isOpen) {
        activateAutoClose();
    } else {
        cancelAutoClose();
    }

    updateStatusToClients();
});

const activateAutoClose = () => {
    cancelAutoClose();
    garageAutoCloseInterval = setInterval(() => {
        if (isGarageOpen()) {
            openCloseGarage();
        } else {
            cancelAutoClose();
        }
    }, 300000);
};

const cancelAutoClose = () => {
    clearInterval(garageAutoCloseInterval as NodeJS.Timeout);
    garageAutoCloseInterval = null;
};

const updateStatusToClients = () =>
    garageStatusSubscribers.forEach((fn) => fn(isGarageOpen()));

const sleep = (time = 5000) =>
    new Promise((resolve) => setTimeout(resolve, time));

export const openCloseGarage = async () => {
    buttonTrigger.write(Gpio.LOW);
    await sleep();
    buttonTrigger.write(Gpio.HIGH);
};

export const garageStatus = (fn: Callback) => {
    garageStatusSubscribers.add(fn);
    return () => garageStatusSubscribers.delete(fn);
};

export const isGarageOpen = (): Status => ({
    isOpen: !Boolean(doorSensor.readSync()),
    dateTime: openCloseDtTm,
    isAutoCloseActive: isAutoCloseActive()
});

export const isAutoCloseActive = () => garageAutoCloseInterval !== null;

export const forceCancelAutoClose = () => {
    cancelAutoClose();
    updateStatusToClients();
};
