export type NodeId = string;

export interface Node {
    id: NodeId;
}

export interface Edge {
    from: NodeId;
    to: NodeId;
}

export class Graph {
    private nodes = new Map<NodeId, Node>();
    private connections = new Map<NodeId, Edge[]>();

    addNode(id: NodeId): void {
        if (this.nodes.has(id)) {
            throw new Error(`Node ${id} already exists`);
        }

        this.nodes.set(id, { id });
        this.connections.set(id, []);
    }

    addEdge(from: NodeId, to: NodeId): void {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
            throw new Error(`Both nodes must exist: ${from}, ${to}`);
        }

        this.connections.get(from)!.push({ from, to });
    }
}