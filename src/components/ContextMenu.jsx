import { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, type, onClose, onAction }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', onClose);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', onClose);
        };
    }, [onClose]);

    if (x === null || y === null) return null;

    return (
        <div
            ref={menuRef}
            className="context-menu glass-panel"
            style={{ top: y, left: x }}
        >
            {type === 'node' && (
                <>
                    <div className="menu-item" onClick={() => onAction('duplicate')}>
                        Duplicar
                    </div>
                    <div className="separator"></div>
                    <div className="menu-item danger" onClick={() => onAction('delete')}>
                        Eliminar
                    </div>
                </>
            )}

            {type === 'edge' && (
                <>
                    <div className="menu-item" onClick={() => onAction('editLabel')}>
                        Editar Etiqueta
                    </div>
                    <div className="separator"></div>
                    <div className="menu-item danger" onClick={() => onAction('delete')}>
                        Eliminar Conexión
                    </div>
                </>
            )}

            <style>{`
            .context-menu {
                position: fixed;
                z-index: 10000;
                min-width: 160px;
                background: var(--bg-panel);
                border: var(--glass-border);
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                padding: 4px;
                overflow: hidden;
            }
            .menu-item {
                padding: 8px 12px;
                cursor: pointer;
                color: var(--text-primary);
                font-size: 0.9rem;
                border-radius: 4px;
                transition: background 0.2s;
            }
            .menu-item:hover {
                background: rgba(255,255,255,0.1);
            }
            .menu-item.danger {
                color: #ef4444;
            }
            .menu-item.danger:hover {
                background: rgba(239, 68, 68, 0.1);
            }
            .separator {
                height: 1px;
                background: rgba(255,255,255,0.1);
                margin: 4px 0;
            }
        `}</style>
        </div>
    );
}
