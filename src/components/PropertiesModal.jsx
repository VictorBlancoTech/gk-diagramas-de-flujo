import { useState, useEffect } from 'react';

export default function PropertiesModal({ isOpen, nodeData, onClose, onSave }) {
    const [scoreMode, setScoreMode] = useState(false);
    // Formula Inputs
    const [benefit, setBenefit] = useState(5); // P (1-10)
    const [knowledge, setKnowledge] = useState(1.0); // C (1.0, 0.8, 0.5)
    const [harm, setHarm] = useState(0); // N (0-10)
    const [irreversibility, setIrreversibility] = useState(1.0); // R (1.0, 2.0)

    // Notes
    const [positiveNotes, setPositiveNotes] = useState('');
    const [negativeNotes, setNegativeNotes] = useState('');

    useEffect(() => {
        if (isOpen && nodeData) {
            setScoreMode(nodeData.scoreMode || false);
            setBenefit(nodeData.benefit ?? 5);
            setKnowledge(nodeData.knowledge ?? 1.0);
            setHarm(nodeData.harm ?? 0);
            setIrreversibility(nodeData.irreversibility ?? 1.0);
            setPositiveNotes(nodeData.positiveNotes || '');
            setNegativeNotes(nodeData.negativeNotes || '');
        }
    }, [isOpen, nodeData]);

    // Calculate Score Automatically
    const calculateScore = () => {
        // Score = [(P * C) - N] / R
        const rawScore = ((benefit * knowledge) - harm) / irreversibility;
        return parseFloat(rawScore.toFixed(1));
    };

    const currentScore = calculateScore();

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            scoreMode,
            score: currentScore, // Save the calculated score
            benefit,
            knowledge,
            harm,
            irreversibility,
            positiveNotes,
            negativeNotes
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h3>Propiedades del Nodo</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="form-group toggle-group">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={scoreMode}
                                onChange={(e) => setScoreMode(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="label-text">Modo Score</span>
                    </div>

                    {scoreMode && (
                        <div className="score-fields fade-in">
                            {/* Score Display */}
                            <div className="score-display">
                                <span className="score-label">Puntaje Calculado:</span>
                                <span className={`score-value ${currentScore < 0 ? 'negative' : ''}`}>{currentScore}</span>
                            </div>

                            {/* P: Beneficio */}
                            <div className="form-group">
                                <label className="flex-between">
                                    <span className="text-success">Beneficio Potencial (P)</span>
                                    <span className="value-badge success">{benefit}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1" max="10" step="1"
                                    value={benefit}
                                    onChange={(e) => setBenefit(Number(e.target.value))}
                                    className="range-slider success"
                                />
                                <small className="text-secondary">Impacto positivo esperado (1-10)</small>
                            </div>

                            {/* C: Conocimiento */}
                            <div className="form-group">
                                <label>Nivel de Conocimiento (C)</label>
                                <div className="btn-group">
                                    {[1.0, 0.8, 0.5].map(val => (
                                        <button
                                            key={val}
                                            className={`toggle-btn ${knowledge === val ? 'active' : ''}`}
                                            onClick={() => setKnowledge(val)}
                                        >
                                            {val === 1.0 && 'Experto (1.0)'}
                                            {val === 0.8 && 'Competente (0.8)'}
                                            {val === 0.5 && 'Principiante (0.5)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* N: Daño */}
                            <div className="form-group">
                                <label className="flex-between">
                                    <span className="text-danger">Daño / Riesgo (N)</span>
                                    <span className="value-badge danger">{harm}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0" max="10" step="1"
                                    value={harm}
                                    onChange={(e) => setHarm(Number(e.target.value))}
                                    className="range-slider danger"
                                />
                                <small className="text-secondary">Impacto negativo si falla (0-10)</small>
                            </div>

                            {/* R: Irreversibilidad */}
                            <div className="form-group">
                                <label>Reversibilidad (R)</label>
                                <div className="btn-group">
                                    <button
                                        className={`toggle-btn ${irreversibility === 1.0 ? 'active' : ''}`}
                                        onClick={() => setIrreversibility(1.0)}
                                    >
                                        Reversible (1.0)
                                    </button>
                                    <button
                                        className={`toggle-btn ${irreversibility === 2.0 ? 'active danger' : ''}`}
                                        onClick={() => setIrreversibility(2.0)}
                                    >
                                        Irreversible (2.0)
                                    </button>
                                </div>
                            </div>

                            <div className="separator"></div>

                            <div className="form-group">
                                <label>Notas Adicionales</label>
                                <textarea
                                    className="textarea-field"
                                    value={positiveNotes} // Reusing this state for the single note
                                    onChange={(e) => setPositiveNotes(e.target.value)}
                                    placeholder="Detalles sobre el calculo..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn primary" onClick={handleSave}>Guardar Cambios</button>
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
                    z-index: 2000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    width: 90%;
                    max-width: 500px;
                    background: var(--bg-panel);
                    border: var(--glass-border);
                    border-radius: 12px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                    display: flex;
                    flex-direction: column;
                }
                .modal-header {
                    padding: 16px 20px;
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
                .modal-body {
                    padding: 20px;
                    overflow-y: auto;
                    max-height: 60vh;
                }
                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                /* Form Styles */
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .input-field, .textarea-field {
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    padding: 10px;
                    color: white;
                    font-family: inherit;
                    box-sizing: border-box;
                }
                .input-field:focus, .textarea-field:focus {
                    outline: none;
                    border-color: var(--accent-color);
                }
                .textarea-field {
                    min-height: 80px;
                    resize: vertical;
                }
                
                .text-success { color: #4ade80 !important; }
                .text-danger { color: #f87171 !important; }
                
                .text-secondary { font-size: 0.8rem; color: #a1a1aa; }
                
                .separator {
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                    margin: 24px 0;
                }
                
                /* Value Badge */
                .flex-between {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .value-badge {
                    background: var(--accent-color);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: bold;
                }
                .value-badge.success {
                    background: #4ade80; /* Green */
                }
                .value-badge.danger {
                    background: #f87171;
                }

                /* Range Slider */
                .range-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 5px;
                    background: #4b5563;
                    outline: none;
                    margin: 10px 0;
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .range-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }
                .range-slider.success::-webkit-slider-thumb {
                    background: #4ade80; /* Green Thumb */
                }
                .range-slider.danger::-webkit-slider-thumb {
                    background: #f87171;
                }

                /* Button Group */
                .btn-group {
                    display: flex;
                    gap: 8px;
                    margin-top: 5px;
                }
                .toggle-btn {
                    flex: 1;
                    padding: 8px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-secondary);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }
                .toggle-btn:hover {
                    background: rgba(255,255,255,0.1);
                }
                .toggle-btn.active {
                    background: var(--accent-color);
                    color: white;
                    border-color: var(--accent-color);
                }
                .toggle-btn.active.danger {
                    background: #ef4444; /* Rojo para irreversible */
                    border-color: #ef4444;
                }
                
                /* Score Display */
                .score-display {
                    background: rgba(0,0,0,0.4);
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .score-label {
                    display: block;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 5px;
                }
                .score-value {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: var(--accent-color);
                    text-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
                }
                .score-value.negative {
                    color: #f87171;
                    text-shadow: 0 0 20px rgba(248, 113, 113, 0.4);
                }

                /* Switch Toggle */
                .toggle-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .label-text {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                .switch input { 
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #3f3f46;
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--accent-color);
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }

                /* Animation */
                .fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
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
