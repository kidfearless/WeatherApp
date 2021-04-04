export class EventManager {
    constructor() {
        this.Events = [];
    }
    Add(callback) {
        this.Events.push(callback);
    }
    Remove(callback) {
        const index = this.Events.indexOf(callback);
        if (index > -1) {
            this.Events.splice(index, 1);
        }
    }
    Invoke(data) {
        this.Events.forEach(callback => {
            callback(data);
        });
    }
}
//# sourceMappingURL=EventManager.js.map