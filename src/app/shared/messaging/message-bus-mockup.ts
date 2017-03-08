import { Injectable, Inject, Provider } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Events, Channels } from '../../device/models';
import { IMessageBus, ChannelEvent } from './message-bus';
import { LifecycleSupport } from '../lifecycle/lifecycle';

export class MessageBusMockup extends LifecycleSupport implements IMessageBus {

    private readonly channels: Map<string, Subject<ChannelEvent>>;
    private readonly messages: Map<string, EventGeneratorCallback[]>;

    constructor() {
        super();
        let eventCount = 5;
        let startDate = new Date();
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        let dateDifference = endDate.getTime() - startDate.getTime();
        let dateOffset = dateDifference / (eventCount * 2);

        this.channels = new Map();
        this.messages = new Map();
        this.messages.set(Channels.DeviceRegister, [() => {
            return {
                channelName: Channels.DeviceRegister,
                eventName: Events.DeviceRegistered,
                data: {
                    deviceId: "Device4",
                    properties: {
                        name: "My second temperature sensor",
                        type: "temperature",
                        interval: Math.random() * 80,
                        isOnline: Math.random() >= 0.5
                    }
                }
            }
        }]);


        this.messages.set("Device1", [
            () => {
                return {
                    channelName: "Device1",
                    eventName: Events.DeviceUpdated,
                    data: {
                        devideId: "Device1",
                        properties: {
                            interval: Math.random() * 11,
                            isOnline: Math.random() >= 0.5
                        }
                    }
                }
            },
            intervalNo => {
                let point1Date = new Date(startDate.getTime() + dateOffset * (intervalNo * 2 - 1));
                let point2Date = new Date(startDate.getTime() + dateOffset * intervalNo * 2);
                return {
                    channelName: "Device1",
                    eventName: Events.MeasurementOccured,
                    data: {
                        devideId: "Device1",
                        points: [
                            {
                                value: Math.random() * 10,
                                timestamp: point1Date
                            },
                            {
                                value: Math.random() * 10,
                                timestamp: point2Date
                            }
                        ]
                    }
                }
            }]);

        this.messages.set("Device4", [
            () => {
                return {
                    channelName: "Device4",
                    eventName: Events.DeviceUpdated,
                    data: {
                        devideId: "Device4",
                        properties: {
                            interval: Math.random() * 6,
                            isOnline: Math.random() >= 0.5
                        }
                    }
                }
            },
            intervalNo => {
                let pointDate = new Date(startDate.getTime() + dateOffset * 2 * intervalNo);
                return {
                    channelName: "Device4",
                    eventName: Events.MeasurementOccured,
                    data: {
                        devideId: "Device4",
                        points: [
                            {
                                value: Math.random() * 20,
                                timestamp: pointDate
                            }
                        ]
                    }
                }
            }]);
        this.messages.set("Device2", [() => {
            return {
                channelName: "Device2",
                eventName: Events.DeviceUpdated,
                data: {
                    devideId: "Device2",
                    properties: {
                        isOnline: Math.random() >= 0.5,
                        isActive: Math.random() >= 0.5
                    }
                }
            }
        }]);
        this.sendEvents(eventCount, 5000);
    }

    publish(event: ChannelEvent): Observable<any> {
        let subject = this.channels.get(event.channelName);
        if (subject) {
            subject.next(event);
        }
        let publishSub = new Subject();
        publishSub.complete();
        return publishSub;
    }

    subscribe(channel: string): Observable<ChannelEvent> {
        let channelSub = this.channels.get(channel);
        if (channelSub) {
            return channelSub;
        }
        channelSub = new Subject();
        this.channels.set(channel, channelSub);
        return channelSub;
    }

    unsubscribe(channel: string): Observable<any> {
        let channelSub = this.channels.get(channel);
        if (channelSub) {
            channelSub.complete();
            this.channels.delete(channel);
            return channelSub;
        }
        return Observable.throw(`The channel ${channel} not found.`);
    }

    doStart(): Observable<any> {
        let subject = new Subject();
        subject.complete();
        return subject;
    }

    doStop(): Observable<any> {
        let subject = new Subject();
        subject.complete();
        return subject;
    }

    private sendEvents(amount: number, delay: number) {

        let counter = 0;
        let intervalPointer: any = setInterval(() => {
            counter++
            this.channels.forEach((subject, channelName) => {
                let generators = this.messages.get(channelName);
                if (generators) {
                    generators.forEach(generator => subject.next(generator(counter)));
                }
            });
            if (counter === amount) {
                window.clearInterval(intervalPointer);
            }
        }, delay);
    }
}

interface EventGeneratorCallback {
    (intervalNo): ChannelEvent;
}