export default function Sidebar({
  onOpenCode,
  onNew,
  onSave,
  diagramName,
  onNameChange,
  savedDiagrams = [],
  onLoad,
  onDelete
}) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar glass-panel">
      {/* Diagram Controls */}
      <div className="control-section">
        <h2 className="sidebar-title">Proyecto</h2>
        <input
          type="text"
          className="name-input"
          value={diagramName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nombre del diagrama"
        />
        <div className="button-group">
          <button onClick={onNew} className="action-btn" title="Nuevo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo
          </button>
          <button onClick={onSave} className="action-btn primary" title="Guardar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar
          </button>
        </div>
      </div>

      <div className="separator" />

      {/* Shapes */}
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
      </div>

      <div className="separator" />

      {/* Saved Diagrams List */}
      <h2 className="sidebar-title">Guardados</h2>
      <div className="saved-list">
        {savedDiagrams.length === 0 && <span className="empty-msg">No hay diagramas guardados</span>}
        {savedDiagrams.map(d => (
          <div key={d.id} className="saved-item">
            <span className="saved-name" onClick={() => onLoad(d.id)}>{d.name}</span>
            <button className="delete-btn" onClick={() => onDelete(d.id)} title="Eliminar">×</button>
          </div>
        ))}
      </div>

      <div className="spacer" style={{ flex: 1 }}></div>
      <div className="separator" />

      {/* Code Editor */}
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

      <style>{`
        .sidebar {
          padding: 20px;
          border-right: var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 15px;
          overflow-y: auto;
        }
        .sidebar-title {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }
        
        /* Controls */
        .name-input {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px;
          border-radius: 4px;
          width: 100%;
          margin-bottom: 8px;
        }
        .button-group {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .action-btn.primary {
          background: var(--accent-color, #3b82f6);
          border-color: var(--accent-color, #3b82f6);
          color: white;
        }
        .action-btn.primary:hover {
          opacity: 0.9;
        }

        .separator {
          height: 1px;
          background: var(--border-color);
          margin: 5px 0;
          flex-shrink: 0;
        }

        /* Shape List */
        .shape-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .shape-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          cursor: grab;
          transition: var(--transition-speed);
          border: 1px solid transparent;
          font-size: 0.9rem;
        }
        .shape-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-glow);
        }
        .icon {
          width: 20px;
          height: 20px;
          border: 2px solid var(--accent-color);
          flex-shrink: 0;
        }
        .icon.pill { border-radius: 99px; }
        .icon.rect { border-radius: 4px; }
        .icon.diamond { transform: rotate(45deg) scale(0.8); }
        .icon.code { border: none; padding: 0; }
        
        .shape-item.action-item { cursor: pointer; }
        .shape-item.action-item:active { transform: scale(0.98); }

        /* Saved List */
        .saved-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        .saved-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
          font-size: 0.85rem;
        }
        .saved-name {
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .saved-name:hover {
          color: var(--accent-color);
          text-decoration: underline;
        }
        .delete-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0 4px;
          line-height: 1;
        }
        .delete-btn:hover {
          color: #ff0000;
        }
        .empty-msg {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-style: italic;
        }
      `}</style>
    </aside>
  );
}
