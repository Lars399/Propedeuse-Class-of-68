class FireDepartment {
    constructor() {
        this.responses = [];
    }

    // Method to record a fire response
    recordResponse(coordinate) {
        const response = { coordinate: coordinate, time: new Date() };
        this.responses.push(response);
        console.log(`Response recorded for fire at ${coordinate} at ${response.time}.`);
    }

    // Method to list all fire responses
    listResponses() {
        return this.responses;
    }
}

// Example usage:
const fd = new FireDepartment();
fd.recordResponse('34.0522 N, 118.2437 W');
console.log(fd.listResponses());
