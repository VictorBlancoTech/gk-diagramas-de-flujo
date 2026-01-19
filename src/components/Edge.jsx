export default function Edge({ start, end }) {
    // Simple straight line for now, can upgrade to bezier later
    // We need to calculate the path string

    // Center of the nodes (approximate based on assumptions or passed props)
    // For now, let's assume valid x,y coordinates are passed

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke="var(--text-secondary)"
                strokeWidth="2"
            />
        </svg>
    )
}
