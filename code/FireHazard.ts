// FireHazard.ts

// Define a class for FireHazard
export class FireHazard {
    private location: { lat: number; lng: number };
    private timer: NodeJS.Timeout | null;
    private notificationSent: boolean;

    constructor(lat: number, lng: number) {
        this.location = { lat, lng };
        this.timer = null;
        this.notificationSent = false;
    }

    // Method to start the elimination timer
    startEliminationTimer(duration: number) {
        this.timer = setTimeout(() => {
            this.eliminateHazard();
        }, duration);
    }

    // Method to eliminate the hazard
    private eliminateHazard() {
        console.log(`Fire hazard at (${this.location.lat}, ${this.location.lng}) has been eliminated.`);
        this.sendNotification();
    }

    // Method to send a notification
    private sendNotification() {
        if (!this.notificationSent) {
            console.log(`Notification: Fire hazard at (${this.location.lat}, ${this.location.lng}) has been eliminated.`);
            this.notificationSent = true;
        }
    }

    // Method to simulate spreading
    spread() {
        console.log(`Fire hazard at (${this.location.lat}, ${this.location.lng}) is spreading.`);
        // Logic for spreading the fire could be implemented here
    }
}