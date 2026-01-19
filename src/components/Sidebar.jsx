export default function Sidebar({ onOpenCode }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar glass-panel">
      <h2 className="sidebar-title">Formas</h2>
      <div className="shape-list">
        <div
          className="shape-item"
          draggable
          onDragStart={(e) => onDragStart(e, 'start')}
        >
          <div className="icon pill"></div>
          Inicio / Fin
        </div>
        <div
          className="shape-item"
          draggable
          onDragStart={(e) => onDragStart(e, 'process')}
        >
          <div className="icon rect"></div>
          Proceso
        </div>
        <div
          className="shape-item"
          draggable
          onDragStart={(e) => onDragStart(e, 'decision')}
        >
          <div className="icon diamond"></div>
          Decisión
        </div>

        <div className="separator" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>

        <div
          className="shape-item action-item"
          onClick={onOpenCode}
        >
          <div className="icon code">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          Editor Código
        </div>
      </div>

      <style>{`
        .sidebar {
          padding: 20px;
          border-right: var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .sidebar-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }
        .shape-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .shape-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          cursor: grab;
          transition: var(--transition-speed);
          border: 1px solid transparent;
        }
        .shape-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-glow);
        }
        .icon {
          width: 24px;
          height: 24px;
          border: 2px solid var(--accent-color);
        }
        .icon.pill { border-radius: 99px; }
        .icon.rect { border-radius: 4px; }
        .icon.diamond { transform: rotate(45deg) scale(0.8); }
        .icon.code { border: none; padding: 2px; }
        .shape-item.action-item { cursor: pointer; }
        .shape-item.action-item:active { transform: scale(0.98); }
      `}</style>
    </aside>
  );
}
