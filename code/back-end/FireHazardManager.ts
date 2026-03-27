class FireHazardManager {
    private timer: NodeJS.Timeout | null = null;
    private eliminationTime: number;

    constructor(eliminationTime: number) {
        this.eliminationTime = eliminationTime; // time to eliminate the hazard in milliseconds
    }

    public startMonitoring() {
        console.log("Fire hazard monitoring started.");
        this.timer = setTimeout(() => this.eliminateHazard(), this.eliminationTime);
    }

    public stopMonitoring() {
        if (this.timer) {
            clearTimeout(this.timer);
            console.log("Fire hazard monitoring stopped.");
        }
    }

    private eliminateHazard() {
        console.log("Fire hazard eliminated!");
        // Additional logic to eliminate the hazard can be implemented here.
    }
}

// Usage
const fireHazardManager = new FireHazardManager(5000); // Set elimination time to 5 seconds
fireHazardManager.startMonitoring();
