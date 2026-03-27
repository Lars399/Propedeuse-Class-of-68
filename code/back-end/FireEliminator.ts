class FireEliminator {
    private fires: Array<{ id: number; timestamp: number }> = [];

    constructor() {}

    // Method to track a new fire
    trackFire(id: number): void {
        const timestamp = Date.now();
        this.fires.push({ id, timestamp });
        this.deleteFireAfterDelay(id);
    }

    // Method to delete fire after 2 minutes and 30 seconds
    private deleteFireAfterDelay(id: number): void {
        setTimeout(() => {
            this.deleteFire(id);
        }, 150000); // 2 minutes 30 seconds in milliseconds
    }

    // Method to delete a fire
    private deleteFire(id: number): void {
        this.fires = this.fires.filter(fire => fire.id !== id);
        console.log(`Fire with id: ${id} has been eliminated.`);
    }

    // Method to get current fires
    public getCurrentFires(): Array<{ id: number; timestamp: number }> {
        return this.fires;
    }
}

// Example usage
const fireEliminator = new FireEliminator();
fireEliminator.trackFire(1);
fireEliminator.trackFire(2);