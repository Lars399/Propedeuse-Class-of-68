class FireHazardEliminator {
    private hazards: string[];
    private deletionTimer: number;

    constructor(deletionTimer: number) {
        this.hazards = [];
        this.deletionTimer = deletionTimer; // time in seconds before hazard is removed
    }

    addHazard(hazard: string): void {
        this.hazards.push(hazard);
        console.log(`Hazard added: ${hazard}`);
        this.scheduleDeletion(hazard);
    }

    private scheduleDeletion(hazard: string): void {
        setTimeout(() => {
            this.removeHazard(hazard);
        }, this.deletionTimer * 1000);
    }

    private removeHazard(hazard: string): void {
        this.hazards = this.hazards.filter(h => h !== hazard);
        console.log(`Hazard removed: ${hazard}`);
    }

    listHazards(): string[] {
        return this.hazards;
    }
}