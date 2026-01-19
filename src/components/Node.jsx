import { useRef, useEffect, useState } from 'react';

export default function Node({ data, onMove, onStartConnect, onCompleteConnect, onContextMenu }) {
    const nodeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, data.id);
    };

    const handleMouseDown = (e) => {
        // If clicking on specific parts (like a handle), don't drag node
        if (e.target.classList.contains('handle')) return;

        // Allow Left Click only for dragging
        if (e.button !== 0) return;

        setIsDragging(true);
        setOffset({
            x: e.clientX - data.position.x,
            y: e.clientY - data.position.y
        });
        e.stopPropagation();
    };

    const handleHandleMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onStartConnect(data.id, { x: e.clientX, y: e.clientY });
    };

    // Accept connections
    const handleMouseUp = (e) => {
        // If a connection drag is in progress (canvas knows via its state), 
        // and we lift mouse here, we are the target.
        // Propagate up.
        onCompleteConnect(data.id);
    };

    // Use a ref to keep track of the latest onMove callback
    // This allows us to exclude onMove from the useEffect dependencies
    // preventing the event listeners from being removed/added on every render
    const onMoveRef = useRef(onMove);

    useEffect(() => {
        onMoveRef.current = onMove;
    }, [onMove]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const newX = e.clientX - offset.x;
            const newY = e.clientY - offset.y;

            if (onMoveRef.current) {
                onMoveRef.current({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, offset]);

    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.data.label);

    const handleDoubleClick = (e) => {
        setIsEditing(true);
        e.stopPropagation();
    };

    const handleBlur = () => {
        setIsEditing(false);
        // Ideally propagate change up 
        data.data.label = label;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            data.data.label = label;
        }
    };

    return (
        <div
            ref={nodeRef}
            className={`node ${data.type}`}
            style={{
                transform: `translate(${data.position.x}px, ${data.position.y}px) ${data.type === 'decision' ? 'rotate(45deg)' : ''}`
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
        >
            <div className="node-content">
                {isEditing ? (
                    <input
                        autoFocus
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="node-input"
                    />
                ) : (
                    label
                )}
            </div>

            {/* Four Handles */}
            <div className="handle top" onMouseDown={handleHandleMouseDown} onMouseUp={handleMouseUp}></div>
            <div className="handle right" onMouseDown={handleHandleMouseDown} onMouseUp={handleMouseUp}></div>
            <div className="handle bottom" onMouseDown={handleHandleMouseDown} onMouseUp={handleMouseUp}></div>
            <div className="handle left" onMouseDown={handleHandleMouseDown} onMouseUp={handleMouseUp}></div>

            <style>{`
        .node {
          position: absolute;
          top: 0;
          left: 0;
          min-width: 120px;
          min-height: 60px;
          background: var(--bg-node);
          border: 1px solid var(--accent-color);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          cursor: grab;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: box-shadow 0.2s;
          padding: 8px;
          font-size: 1rem;
          box-sizing: border-box; /* Crucial for size calculations */
          pointer-events: auto; /* Re-enable clicks inside the non-interactive container */
        }
        .node-input {
          background: transparent;
          border: none;
          color: white;
          text-align: center;
          width: 100%;
          outline: none;
          font-family: inherit;
          font-size: inherit;
        }
        
        .handle {
           position: absolute;
           width: 10px;
           height: 10px;
           background: var(--accent-color);
           border: 2px solid var(--bg-node);
           border-radius: 50%;
           cursor: crosshair;
           z-index: 20;
           transition: transform 0.2s;
        }
        .handle:hover {
           transform: scale(1.5);
        }

        /* Handle Positions */
        .handle.top { left: 50%; top: -6px; transform: translateX(-50%); }
        .handle.top:hover { transform: translateX(-50%) scale(1.5); }

        .handle.bottom { left: 50%; bottom: -6px; transform: translateX(-50%); }
        .handle.bottom:hover { transform: translateX(-50%) scale(1.5); }

        .handle.right { top: 50%; right: -6px; transform: translateY(-50%); }
        .handle.right:hover { transform: translateY(-50%) scale(1.5); }

        .handle.left { top: 50%; left: -6px; transform: translateY(-50%); }
        .handle.left:hover { transform: translateY(-50%) scale(1.5); }

        .node:active {
          cursor: grabbing;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          z-index: 100;
        }
        
        /* Shapes & Specific Styles */
        
        /* Start/End: Green */
        .node.start {
          border-radius: 30px;
          border-color: #10b981; 
        }
        .node.start .handle { background: #10b981; }

        /* Process: Default Blue (inherits) */
        .node.process {
          border-radius: 8px;
        }

        /* Decision: Orange */
        .node.decision {
          width: 100px;
          height: 100px;
          min-width: 0; /* Override generic min-width */
          min-height: 0;
          /* Use a diamond shape visually but keep content centered */
          transform: rotate(45deg); 
          border: 2px solid #f97316;
          border-radius: 4px;
        }
        
        /* Un-rotate content so text is straight */
        /* Un-rotate content so text is straight */
        .node.decision .node-content {
           transform: rotate(-45deg);
           font-size: 0.9em;
           padding: 0;
           width: 100%;
           height: 100%;
           display: flex;
           align-items: center;
           justify-content: center;
           text-align: center;
        }

        /* Un-rotate handles so they align with the diamond corners properly */
        .node.decision .handle {
           background: #f97316; /* Orange */
           border-color: var(--bg-node);
        }
        
        /* Adjust handles for Decision (Diamond) to be at the CORNERS of the div */
        .node.decision .handle.top { 
            top: -5px; left: -5px; /* Top-Left corner */
            transform: none; 
        }
        .node.decision .handle.right {
             top: -5px; right: -5px; /* Top-Right corner */
             left: auto; transform: none;
        }
        .node.decision .handle.bottom {
             bottom: -5px; right: -5px; /* Bottom-Right corner */
             left: auto; top: auto; transform: none;
        }
        .node.decision .handle.left {
             bottom: -5px; left: -5px; /* Bottom-Left corner */
             top: auto; right: auto; transform: none;
        }
        
        /* Fix hover on rotated handles */
        .node.decision .handle:hover {
           transform: scale(1.5);
        }

      `}</style>
        </div>
    );
}
