import { Gpio } from "onoff";

let garageAutoCloseInterval: NodeJS.Timeout;
const buttonTrigger = new Gpio(4, "out", undefined, {
    reconfigureDirection: false
});
const doorSensor = new Gpio(2, "in", "both", {
    reconfigureDirection: false,
    debounceTimeout: 1000
});

type Callback = (status: boolean) => void;
const garageStatusSubscribers = new Set<Callback>();

doorSensor.watch((err, value) => {
    if (err) console.error(err);

    const isOpen = !Boolean(value);

    if (isOpen) {
        activateAutoClose();
    } else {
        clearInterval(garageAutoCloseInterval);
    }

    garageStatusSubscribers.forEach((fn) => fn(isOpen));
});

const activateAutoClose = () => {
    clearInterval(garageAutoCloseInterval);
    garageAutoCloseInterval = setInterval(() => {
        if (isGarageOpen()) {
            openCloseGarage();
        } else {
            clearInterval(garageAutoCloseInterval);
        }
    }, 300000);
};

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

export const isGarageOpen = () => !Boolean(doorSensor.readSync());

export const cancelAutoClose = () => clearInterval(garageAutoCloseInterval);
