# Tracks in the Dark - Workshop

Welcome to the workshop repository for the Tracks in the Dark hackathon regarding Graphs.


## Basic Graph Implementation

Let us begin with implementing a basic graph in TypeScript.
The first step is the ability to identify a single node in the graph.
A `type` is created to give a name to the identifier, which is an mapping for a `string` type.
This way, it is not required to remember which type was assigned as an Id,
since the language server will provide this information for us.
It also reads better, but that's personal preference.

```ts
export type NodeId = string;
```

The next step is to create the graph object.
As said before, a graph contains nodes and edges, so let's model them.
Since the structure of the data is being defined, an `interface` is used.
A class is overkill, we are only defining structure, not behaviour.
A type is designed for complexer structures or type mappings.

```ts
// A node is a single point on the graph
export interface Node {
    id: NodeId;
}

// An edge is a connection between two nodes
export interface Edge {
    from: NodeId;
    to: NodeId;
}
```

The basic structure is ready, now the components need to come together.
A class is made to represent a graph. Maps are used to store the components.
First, a nodes field is introduced storing the individual nodes,
secondly, a connections list is introduced. This concept is called an `adjacency list`.
The nice thing about maps is the ability to use the `set` and  `get` methods.
The positions are calculated rather than looked-up, which makes the structure whicked fast.
If you are interested in why this is, look for [Hash Maps]https://en.wikipedia.org/wiki/Hash_table).
In addition, get and set just reads better than endless loops 😂.

It does require some explanation on the `?` and `??` operators.
Both operators are used when it is possible to get an `undefined` value.
The `addEdge` function below uses the `?` operator to determine whether the node exists in the list.
If it exists, the push is executed. If it does not exist, nothing happens.
The `??` operator is covered when it appears in code. 

```ts
export class Graph {
    // The components of the graph
    private nodes = new Map<NodeId, Node>();
    private connections = new Map<NodeId, Edge[]>();

    // Adding a node to the graph
    addNode(id: NodeId): void {
        this.nodes.set(id, { id });
        this.connections.set(id, []);
    }

    // Adding a connection between to nodes
    addEdge(from: NodeId, to: NodeId): void {
        this.connections.get(from)?.push({ from, to });
    }
}
```

Finally, it is important that we make sure this works.
Therefore, a method will be added that can be called later.
This method returns the list of all edges for a specific node.
It uses the `??` operator, if the operation on the left of the operator returns undefined, 
the value on the right is returned instead. In other words:
if the provided id is not present in the list of connections, an empty list is returned instead.

```ts
// Getting the edges for a specific node
getConnections(id: NodeId): Edge[] {
    return this.connections.get(id) ?? [];
}
```