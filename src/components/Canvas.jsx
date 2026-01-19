import { useRef, useState, useEffect } from 'react';
import Node from './Node';
import Edge from './Edge';

export default function Canvas({ nodes, edges, onAddNode, onMoveNode, onConnect, onNodeContextMenu, onEdgeContextMenu, onEdgeDoubleClick }) {
    const canvasRef = useRef(null);
    const [connectingSourceId, setConnectingSourceId] = useState(null);
    const [tempLine, setTempLine] = useState(null);

    // Pan State
    const [viewTransform, setViewTransform] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Handle Space Key for Panning Mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                setIsSpacePressed(true);
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
                setIsPanning(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const onDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // Adjust for Pan: (Screen - Rect - Pan)
        const position = {
            x: event.clientX - rect.left - viewTransform.x,
            y: event.clientY - rect.top - viewTransform.y
        };

        onAddNode(type, position);
    };

    // Connection Handlers
    const handleStartConnect = (sourceId, startPos) => {
        if (isSpacePressed) return; // Don't start connect if panning intent
        setConnectingSourceId(sourceId);
        const rect = canvasRef.current.getBoundingClientRect();

        // Start position is already in world coordinates (from Node)
        // TempLine needs to be rendered in the TRANSFORMED content layer now
        // So we can just use the raw coordinates relative to the world origin
        // BUT wait, tempLine is inside the SVG which is inside the transform container?
        // Let's assume we put ALL content in a transform container.

        // If tempLine is inside the scaled/translated container, we use world coordinates directly.
        // Node provides World Coordinates in startPos.
        // Canvas Rect is needed only if startPos was screen coordinates. 
        // Node.jsx sends: x: e.clientX, y: e.clientY. That IS screen coordinates.
        // So we convert screen -> world.

        const worldX = startPos.x - rect.left - viewTransform.x;
        const worldY = startPos.y - rect.top - viewTransform.y;

        setTempLine({
            x1: worldX,
            y1: worldY,
            x2: worldX,
            y2: worldY
        });
    };

    const handleMouseDown = (e) => {
        // Space + Left Click = Start Pan
        if (isSpacePressed && e.button === 0) {
            setIsPanning(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e) => {
        // Handle Panning
        if (isPanning) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            setViewTransform(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));

            setDragStart({ x: e.clientX, y: e.clientY });
            return;
        }

        // Handle Connection Drag
        if (connectingSourceId && tempLine) {
            const rect = canvasRef.current.getBoundingClientRect();
            // Convert current mouse screen pos -> world pos
            const worldX = e.clientX - rect.left - viewTransform.x;
            const worldY = e.clientY - rect.top - viewTransform.y;

            setTempLine(prev => ({
                ...prev,
                x2: worldX,
                y2: worldY
            }));
        }
    };

    const handleMouseUp = (e) => {
        if (isPanning) {
            setIsPanning(false);
            return;
        }
        setConnectingSourceId(null);
        setTempLine(null);
    };

    const handleCompleteConnect = (targetId) => {
        if (connectingSourceId) {
            onConnect(connectingSourceId, targetId);
            setConnectingSourceId(null);
            setTempLine(null);
        }
    };

    return (
        <main
            className={`canvas-area ${isSpacePressed ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
            ref={canvasRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {/* Movable Container for ALL Content */}
            <div
                className="viewport"
                style={{
                    transform: `translate(${viewTransform.x}px, ${viewTransform.y}px)`,
                    width: '100%',
                    height: '100%'
                }}
            >
                <div className="edges-layer">
                    <svg style={{ width: '100%', height: '100%', position: 'absolute', overflow: 'visible', pointerEvents: 'none', zIndex: 0 }}>
                        {edges.map(edge => {
                            const startNode = nodes.find(n => n.id === edge.source);
                            const endNode = nodes.find(n => n.id === edge.target);
                            if (!startNode || !endNode) return null;

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
                                    <line
                                        x1={start.x} y1={start.y}
                                        x2={end.x} y2={end.y}
                                        stroke="transparent"
                                        strokeWidth="15"
                                    />
                                    <line
                                        x1={start.x} y1={start.y}
                                        x2={end.x} y2={end.y}
                                        stroke="var(--text-secondary)"
                                        strokeWidth="2"
                                    />
                                </g>
                            );
                        })}

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

                        {/* Temp Line is now also inside the Viewport, so uses World Coords */}
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
            </div>

            <div
                className="canvas-background"
                style={{
                    backgroundPosition: `${viewTransform.x}px ${viewTransform.y}px`
                }}
            ></div>

            <style>{`
        .canvas-area {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: var(--bg-app);
        }
        .cursor-grab { cursor: grab !important; }
        .cursor-grabbing { cursor: grabbing !important; }
        
        .cursor-grab .viewport {
            pointer-events: none !important;
        }
        /* Ensure specific children don't override this when in grab mode */
        .cursor-grab .viewport * {
            pointer-events: none !important;
        }
        
        .viewport {
            position: absolute;
            top: 0; 
            left: 0;
            transform-origin: 0 0;
            pointer-events: none; /* Let clicks pass through viewport logic to children */
        }
        /* Re-enable events for layers inside viewport */
        .viewport > .edges-layer, .viewport > .nodes-layer {
            pointer-events: none; /* Containers still none */
        }
        /* SVG inside edges-layer handles its own pointer-events */
        
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
