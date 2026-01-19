export const generateMermaid = (nodes, edges) => {
    let mermaidCode = 'graph TD\n';

    // Add Nodes
    nodes.forEach(node => {
        // Sanitizar label: quitar corchetes que puedan romper mermaid
        const rawLabel = node.data.label || 'Node';
        const label = rawLabel.replace(/[\\[\\]\\(\\)\\{\\}]/g, '');

        let nodeStr = '';
        switch (node.type) {
            case 'start':
                // Mermaid: id((Label)) - aunque start/end suele ser rounded
                // Usaremos id([Label]) para terminal (stadium shape) o id((Label)) para círculo
                nodeStr = `${node.id}(([${label}]))`;
                break;
            case 'decision':
                // Mermaid: id{Label}
                nodeStr = `${node.id}{${label}}`;
                break;
            case 'process':
            default:
                // Mermaid: id[Label]
                nodeStr = `${node.id}[${label}]`;
                break;
        }
        mermaidCode += `    ${nodeStr}\n`;
    });

    // Add Edges
    edges.forEach(edge => {
        if (edge.label) {
            mermaidCode += `    ${edge.source} -->|${edge.label}| ${edge.target}\n`;
        } else {
            mermaidCode += `    ${edge.source} --> ${edge.target}\n`;
        }
    });

    return mermaidCode;
};

export const parseMermaid = (code) => {
    const nodes = [];
    const edges = [];
    const lines = code.split('\n');

    // Basic Regex for nodes
    // Captures: 1=ID, 2=ShapeOpen, 3=Label, 4=ShapeClose
    // Supports: A[Label], B{Label}, C((Label)), D([Label])
    const nodeRegex = /^\s*([a-zA-Z0-9_-]+)(\[|\{|\(\(|\(\[)(.*?)(\]|\}|\)\)|\)\])\s*$/;

    // Regex for edges: 
    // 1. A -->|Label| B  (Source: Group 1, Label: Group 2, Target: Group 4)
    // 2. A -- Label --> B (Source: Group 1, Label: Group 3, Target: Group 4)
    // 3. A --> B (Source: Group 1, Target: Group 4)
    const edgeRegex = /^\s*([a-zA-Z0-9_-]+)\s*(?:-->\|(.+?)\|\s*|--\s*(.+?)\s*-->\s*|-->\s*)([a-zA-Z0-9_-]+)\s*$/;

    // Note for Regex:
    // Group 1: Source
    // Group 2: Label (style |Label|)
    // Group 3: Label (style -- Label -->)
    // Group 4: Target

    let yOffset = 50;

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.startsWith('graph') || cleanLine.startsWith('%%')) return;

        // Check for Edge first
        const edgeMatch = cleanLine.match(edgeRegex);
        if (edgeMatch) {
            const source = edgeMatch[1];
            // Label can be in group 2 OR group 3
            const label = (edgeMatch[2] || edgeMatch[3] || '').trim();
            const target = edgeMatch[4];

            edges.push({
                id: crypto.randomUUID(),
                source,
                target,
                label: label || null
            });
            return;
        }

        // Check for Node
        const nodeMatch = cleanLine.match(nodeRegex);
        if (nodeMatch) {
            const id = nodeMatch[1];
            const shapeOpen = nodeMatch[2];
            const label = nodeMatch[3];

            let type = 'process';
            if (shapeOpen === '{') type = 'decision';
            else if (shapeOpen === '((' || shapeOpen === '([') type = 'start'; // Start/End

            nodes.push({
                id,
                type,
                position: { x: 250, y: yOffset }, // Default Center Alignment
                data: { label }
            });
            yOffset += 120; // Stack vertically
        }
    });

    return { nodes, edges };
};
