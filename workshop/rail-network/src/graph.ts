export type SwitchId = string;

export interface Position {
    x: number;
    y: number;
}

export interface Switch {
    id: SwitchId;
    position: Position;
}

export interface Track {
    from: SwitchId;
    to: SwitchId;
    cars: number;
}

export class Graph {
    private switches = new Map<SwitchId, Switch>();
    private connections = new Map<SwitchId, Track[]>();

    addSwitch(id: SwitchId, position: Position): void {
        this.switches.set(id, { id, position });
        this.connections.set(id, []);
    }

    addTrack(from: SwitchId, to: SwitchId): void {
        this.connections.get(from)?.push({ from, to, cars: 0 });
    }

    getConnections(id: SwitchId): Track[] {
        return this.connections.get(id) ?? [];
    }

    updateTrack(from: SwitchId, to: SwitchId, cars: number): void {
        const tracks = this.connections.get(from);
        if (!tracks) return;

        const track = tracks.find(t => t.to === to);
        if (track) {
            track.cars = cars;
        }
    }

    render(canvas: HTMLCanvasElement): void {
        const context = canvas.getContext('2d')!;

        // Drawing the background
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the tracks
        for (const tracks of this.connections.values()) {
            for (const track of tracks) {
                // Set the color and width of the track based on the number of cars
                context.strokeStyle = track.cars > 0 ? 'red' : 'white';
                context.fillStyle = track.cars > 0 ? 'red' : 'white';
                context.lineWidth = 2;
                
                // Draw line between switches
                const fromSwitch = this.switches.get(track.from)!;
                const toSwitch = this.switches.get(track.to)!;
                
                context.beginPath();
                context.moveTo(fromSwitch.position.x, fromSwitch.position.y);
                context.lineTo(toSwitch.position.x, toSwitch.position.y);
                context.stroke();
                
                // Draw arrowhead in the middle of the edge
                const middleX = (fromSwitch.position.x + toSwitch.position.x) / 2;
                const middleY = (fromSwitch.position.y + toSwitch.position.y) / 2;
                const differenceX = toSwitch.position.x - fromSwitch.position.x;
                const differenceY = toSwitch.position.y - fromSwitch.position.y;
                const angle = Math.atan2(differenceY, differenceX);

                context.save();
                context.translate(middleX, middleY);
                context.rotate(angle);
                context.beginPath();
                context.moveTo(5, 0);
                context.lineTo(-5, -5);
                context.lineTo(-5, 5);
                context.closePath();
                context.fill();
                context.restore();
            }
        }

        // Draw the switches
        context.fillStyle = 'orange';
        for (const switcher of this.switches.values()) {
            context.beginPath();
            context.arc(switcher.position.x, switcher.position.y, 10, 0, Math.PI * 2);
            context.fill();
        }
    }
}