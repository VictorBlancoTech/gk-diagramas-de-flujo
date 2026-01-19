import { useState, useEffect } from 'react';

export default function CodeEditor({ isOpen, code, onClose, onImport }) {
    const [localCode, setLocalCode] = useState(code);

    useEffect(() => {
        setLocalCode(code);
    }, [code, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h3>Código Mermaid (Solo Lectura / Importación)</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="editor-container">
                    <textarea
                        value={localCode}
                        onChange={(e) => setLocalCode(e.target.value)}
                        className="code-textarea"
                        spellCheck="false"
                    />
                </div>

                <div className="modal-footer">
                    <div className="warning-text">
                        ⚠️ Importar reajustará las posiciones de los nodos.
                    </div>
                    <div className="actions">
                        <button className="btn secondary" onClick={() => navigator.clipboard.writeText(localCode)}>
                            Copiar
                        </button>
                        <button className="btn primary" onClick={() => { onImport(localCode); onClose(); }}>
                            Actualizar Diagrama
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          width: 80%;
          max-width: 600px;
          height: 70vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-panel);
          border: var(--glass-border);
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .modal-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 24px;
          cursor: pointer;
        }
        .editor-container {
          flex: 1;
          padding: 0;
          position: relative;
        }
        .code-textarea {
          width: 100%;
          height: 100%;
          background: #1e1e1e;
          color: #d4d4d4;
          border: none;
          padding: 16px;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
          resize: none;
          outline: none;
        }
        .modal-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .warning-text {
            color: #eab308;
            font-size: 0.9rem;
        }
        .actions {
            display: flex;
            gap: 10px;
        }
        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            border: none;
            transition: all 0.2s;
        }
        .btn.primary {
            background: var(--accent-color);
            color: white;
        }
        .btn.primary:hover {
            box-shadow: 0 0 10px var(--accent-glow);
        }
        .btn.secondary {
            background: rgba(255,255,255,0.1);
            color: var(--text-primary);
        }
        .btn.secondary:hover {
            background: rgba(255,255,255,0.2);
        }
      `}</style>
        </div>
    );
}
