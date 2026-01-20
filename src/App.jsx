import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import CodeEditor from './components/CodeEditor'
import ContextMenu from './components/ContextMenu'
import PropertiesModal from './components/PropertiesModal'
import { generateMermaid, parseMermaid } from './utils/mermaidHelper'
import { DiagramStorage } from './utils/storage'

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  // Diagram State
  const [currentDiagramId, setCurrentDiagramId] = useState(null)
  const [diagramName, setDiagramName] = useState('Untitled Diagram')
  const [savedDiagrams, setSavedDiagrams] = useState([])

  // Load initial data
  useEffect(() => {
    const list = DiagramStorage.getList();
    setSavedDiagrams(list);

    if (list.length > 0) {
      // Load most recent
      const mostRecent = list[0];
      loadDiagram(mostRecent.id);
    } else {
      // Initialize new
      createNewDiagram();
    }
  }, []);

  const createNewDiagram = () => {
    const newId = crypto.randomUUID();
    setCurrentDiagramId(newId);
    setDiagramName('Untitled Diagram');
    setNodes([]);
    setEdges([]);
  };

  const loadDiagram = (id) => {
    const data = DiagramStorage.load(id);
    if (data) {
      setCurrentDiagramId(data.id);
      setDiagramName(data.name);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    }
  };

  const saveDiagram = () => {
    if (!currentDiagramId) return;
    DiagramStorage.save(currentDiagramId, diagramName, nodes, edges);
    // Refresh list
    setSavedDiagrams(DiagramStorage.getList());
    alert('Diagrama guardado correctamente');
  };

  const deleteDiagram = (id) => {
    if (confirm('¿Estás seguro de eliminar este diagrama?')) {
      DiagramStorage.delete(id);
      const list = DiagramStorage.getList();
      setSavedDiagrams(list);

      // If deleted current, switch to another or create new
      if (id === currentDiagramId) {
        if (list.length > 0) loadDiagram(list[0].id);
        else createNewDiagram();
      }
    }
  };

  const handleNameChange = (newName) => {
    setDiagramName(newName);
  };

  // Mermaid Integration State
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [mermaidCode, setMermaidCode] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);

  // [NEW] Properties Modal State
  const [propertiesModal, setPropertiesModal] = useState({ isOpen: false, nodeId: null });

  const handleAddNode = (type, position) => {
    const newNode = {
      id: crypto.randomUUID(),
      type,
      position,
      data: {
        label: type === 'decision' ? '¿Decisión?' : (type === 'start' ? 'Inicio' : 'Proceso'),
        // Initialize score props
        scoreMode: false,
        score: 5.0,
        benefit: 5,
        knowledge: 1.0,
        harm: 0,
        irreversibility: 1.0,
        positiveNotes: '',
        negativeNotes: ''
      }
    }
    setNodes((prev) => [...prev, newNode])
  }

  const handleUpdateNodePosition = useCallback((id, newPos) => {
    setNodes((prev) => prev.map(n => n.id === id ? { ...n, position: newPos } : n))
  }, [])

  const handleConnect = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    // Prevent duplicates
    if (edges.find(e => e.source === sourceId && e.target === targetId)) return;

    const newEdge = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId
    };
    setEdges(prev => [...prev, newEdge]);
  };

  // Open Code Editor (Generate)
  const handleOpenCode = () => {
    const code = generateMermaid(nodes, edges);
    setMermaidCode(code);
    setIsCodeOpen(true);
  };

  // Import Code (Parse)
  const handleImportMermaid = (code) => {
    try {
      const { nodes: newNodes, edges: newEdges } = parseMermaid(code);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      alert("Error al importar Mermaid: " + error.message);
    }
  };

  // Context Menu Handlers
  const handleContextMenu = (e, type, id) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      targetId: id
    });
  };

  // [NEW] Properties Handlers
  const handleOpenProperties = (nodeId) => {
    setPropertiesModal({ isOpen: true, nodeId });
  };

  const handleSaveProperties = (newProps) => {
    setNodes(prev => prev.map(n => {
      if (n.id === propertiesModal.nodeId) {
        return {
          ...n,
          data: { ...n.data, ...newProps }
        };
      }
      return n;
    }));
  };

  const handleMenuAction = (action) => {
    const { type, targetId } = contextMenu;

    if (action === 'delete') {
      if (type === 'node') {
        setNodes(prev => prev.filter(n => n.id !== targetId));
        setEdges(prev => prev.filter(e => e.source !== targetId && e.target !== targetId));
      } else if (type === 'edge') {
        setEdges(prev => prev.filter(e => e.id !== targetId));
      }
    }
    else if (action === 'duplicate' && type === 'node') {
      const original = nodes.find(n => n.id === targetId);
      if (original) {
        const newNode = {
          ...original,
          id: crypto.randomUUID(),
          position: { x: original.position.x + 20, y: original.position.y + 20 }
        };
        setNodes(prev => [...prev, newNode]);
      }
    }
    else if (action === 'properties' && type === 'node') {
      handleOpenProperties(targetId);
    }
    else if (action === 'editLabel' && type === 'edge') {
      const edge = edges.find(e => e.id === targetId);
      if (edge) {
        const newLabel = prompt("Etiqueta de conexión:", edge.label || "");
        if (newLabel !== null) { // If not cancelled
          setEdges(prev => prev.map(e => e.id === targetId ? { ...e, label: newLabel } : e));
        }
      }
    }

    setContextMenu(null);
  };

  const handleEdgeDoubleClick = (e, edgeId) => {
    const edge = edges.find(ed => ed.id === edgeId);
    if (edge) {
      const newLabel = prompt("Etiqueta de conexión:", edge.label || "");
      if (newLabel !== null) {
        setEdges(prev => prev.map(ed => ed.id === edgeId ? { ...ed, label: newLabel } : ed));
      }
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        onOpenCode={handleOpenCode}
        onNew={createNewDiagram}
        onSave={saveDiagram}
        diagramName={diagramName}
        onNameChange={handleNameChange}
        savedDiagrams={savedDiagrams}
        onLoad={loadDiagram}
        onDelete={deleteDiagram}
      />
      <Canvas
        nodes={nodes}
        edges={edges}
        onAddNode={handleAddNode}
        onMoveNode={handleUpdateNodePosition}
        onConnect={handleConnect}
        onNodeContextMenu={(e, id) => handleContextMenu(e, 'node', id)}
        onEdgeContextMenu={(e, id) => handleContextMenu(e, 'edge', id)}
        onEdgeDoubleClick={handleEdgeDoubleClick}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onAction={handleMenuAction}
        />
      )}

      {/* [NEW] Properties Modal */}
      <PropertiesModal
        isOpen={propertiesModal.isOpen}
        nodeData={nodes.find(n => n.id === propertiesModal.nodeId)?.data}
        onClose={() => setPropertiesModal({ isOpen: false, nodeId: null })}
        onSave={handleSaveProperties}
      />

      <CodeEditor
        isOpen={isCodeOpen}
        code={mermaidCode}
        onClose={() => setIsCodeOpen(false)}
        onImport={handleImportMermaid}
      />

      <style>{`
        .app-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          height: 100vh;
          width: 100vw;
        }
      `}</style>
    </div>
  )
}

export default App
