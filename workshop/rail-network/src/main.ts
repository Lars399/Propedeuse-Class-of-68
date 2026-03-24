import { Graph } from './graph.js'

window.onload = () => {
    console.log('hello world');
    const graph = new Graph();
    const canvas = document.getElementById("graph") as HTMLCanvasElement;
    
    graph.addSwitch("A", { x: 0, y: 250 });
    graph.addSwitch("B", { x: 100, y: 250 });
    graph.addSwitch("C", { x: 125, y: 200 });
    graph.addSwitch("D", { x: 125, y: 300 });
    graph.addSwitch("E", { x: 375, y: 200 });
    graph.addSwitch("F", { x: 375, y: 300 });
    graph.addSwitch("G", { x: 400, y: 250 });
    graph.addSwitch("H", { x: 500, y: 250 });

    graph.addTrack("A", "B");
    graph.addTrack("B", "C");
    graph.addTrack("B", "D");
    graph.addTrack("C", "E");
    graph.addTrack("D", "F");
    graph.addTrack("E", "G");
    graph.addTrack("F", "G");
    graph.addTrack("G", "H");

    graph.updateTrack("B", "D", 2);
    graph.updateTrack("D", "F", 3);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    graph.render(canvas);
}