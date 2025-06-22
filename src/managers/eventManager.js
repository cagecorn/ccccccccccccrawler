// src/eventManager.js
export class EventManager {
    constructor() {
        this.listeners = {};
    }
    subscribe(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    }
    publish(eventName, data) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }
}
