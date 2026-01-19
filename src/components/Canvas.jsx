import { useRef, useState } from 'react';
import Node from './Node';
import Edge from './Edge';

export default function Canvas({ nodes, edges, onAddNode, onMoveNode, onConnect, onNodeContextMenu, onEdgeContextMenu, onEdgeDoubleClick }) {
    const canvasRef = useRef(null);
    const [connectingSourceId, setConnectingSourceId] = useState(null);
    const [tempLine, setTempLine] = useState(null);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        onAddNode(type, position);
    };

    // Connection Handlers
    const handleStartConnect = (sourceId, startPos) => {
        setConnectingSourceId(sourceId);
        const rect = canvasRef.current.getBoundingClientRect();
        // Offset relative to canvas
        setTempLine({
            x1: startPos.x - rect.left,
            y1: startPos.y - rect.top,
            x2: startPos.x - rect.left,
            y2: startPos.y - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (connectingSourceId && tempLine) {
            const rect = canvasRef.current.getBoundingClientRect();
            setTempLine(prev => ({
                ...prev,
                x2: e.clientX - rect.left,
                y2: e.clientY - rect.top
            }));
        }
    };

    const handleMouseUp = (e) => {
        // If dropped on a node, that node's MouseUp will handle trigger connection
        // Here we just clear state if dropped on empty canvas
        setConnectingSourceId(null);
        setTempLine(null);
    };

    // Called when mouseup happens on a potential target node
    const handleCompleteConnect = (targetId) => {
        if (connectingSourceId) {
            onConnect(connectingSourceId, targetId);
            setConnectingSourceId(null);
            setTempLine(null);
        }
    };

    return (
        <main
            className="canvas-area"
            ref={canvasRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div className="edges-layer">
                <svg style={{ width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none', zIndex: 0 }}>
                    {edges.map(edge => {
                        const startNode = nodes.find(n => n.id === edge.source);
                        const endNode = nodes.find(n => n.id === edge.target);
                        if (!startNode || !endNode) return null;

                        // Calculate centers for "Center to Center" connection
                        const getCenter = (n) => {
                            if (n.type === 'decision') {
                                return { x: n.position.x + 50, y: n.position.y + 50 };
                            }
                            return { x: n.position.x + 60, y: n.position.y + 30 };
                        };

                        const start = getCenter(startNode);
                        const end = getCenter(endNode);

                        return (
                            <g
                                key={edge.id}
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdgeContextMenu(e, edge.id);
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    onEdgeDoubleClick(e, edge.id);
                                }}
                            >
                                {/* Invisible Thicker Line for easier clicking */}
                                <line
                                    x1={start.x} y1={start.y}
                                    x2={end.x} y2={end.y}
                                    stroke="transparent"
                                    strokeWidth="15"
                                />
                                {/* Visible Line */}
                                <line
                                    x1={start.x} y1={start.y}
                                    x2={end.x} y2={end.y}
                                    stroke="var(--text-secondary)"
                                    strokeWidth="2"
                                />
                            </g>
                        );
                    })}

                    {/* Render Labels on top of lines */}
                    {edges.map(edge => {
                        const startNode = nodes.find(n => n.id === edge.source);
                        const endNode = nodes.find(n => n.id === edge.target);
                        if (!startNode || !endNode || !edge.label) return null;

                        const getCenter = (n) => {
                            if (n.type === 'decision') {
                                return { x: n.position.x + 50, y: n.position.y + 50 };
                            }
                            return { x: n.position.x + 60, y: n.position.y + 30 };
                        };
                        const start = getCenter(startNode);
                        const end = getCenter(endNode);
                        const midX = (start.x + end.x) / 2;
                        const midY = (start.y + end.y) / 2;

                        return (
                            <g key={edge.id + '-label'}>
                                <rect
                                    x={midX - (edge.label.length * 4) - 4}
                                    y={midY - 10}
                                    width={(edge.label.length * 8) + 8}
                                    height="20"
                                    fill="var(--bg-app)"
                                    rx="4"
                                    stroke="var(--border-color)"
                                    strokeWidth="1"
                                />
                                <text
                                    x={midX}
                                    y={midY}
                                    dy="0.3em"
                                    textAnchor="middle"
                                    fill="var(--text-primary)"
                                    fontSize="12px"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {edge.label}
                                </text>
                            </g>
                        );
                    })}
                    {/* Temporary Connection Line */}
                    {tempLine && (
                        <line
                            x1={tempLine.x1} y1={tempLine.y1}
                            x2={tempLine.x2} y2={tempLine.y2}
                            stroke="var(--accent-color)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    )}
                </svg>
            </div>

            <div className="nodes-layer">
                {nodes.map(node => (
                    <Node
                        key={node.id}
                        data={node}
                        onMove={(newPos) => onMoveNode(node.id, newPos)}
                        onStartConnect={handleStartConnect}
                        onCompleteConnect={handleCompleteConnect}
                        onContextMenu={onNodeContextMenu}
                    />
                ))}
            </div>

            {/* Grid Pattern Background */}
            <div className="canvas-background"></div>

            <style>{`
        .canvas-area {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: var(--bg-app);
        }
        .canvas-background {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.5;
          pointer-events: none;
        }
        .nodes-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      `}</style>
        </main>
    );
}
