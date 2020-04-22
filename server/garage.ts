import { Gpio } from "onoff";

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

    garageStatusSubscribers.forEach((fn) => fn(!Boolean(value)));
});

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
