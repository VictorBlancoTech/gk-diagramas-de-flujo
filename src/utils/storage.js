// Storage Keys
const DIAGRAMS_KEY = 'gk_flowcharts_index';
const PREFIX = 'gk_flow_';

/**
 * @typedef {Object} DiagramMeta
 * @property {string} id
 * @property {string} name
 * @property {number} lastModified
 */

const getStorage = () => {
    try {
        const index = localStorage.getItem(DIAGRAMS_KEY);
        return index ? JSON.parse(index) : [];
    } catch (e) {
        console.error('Error reading storage', e);
        return [];
    }
};

const setStorage = (list) => {
    localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(list));
};

export const DiagramStorage = {
    /**
     * Get list of all saved diagrams
     * @returns {DiagramMeta[]}
     */
    getList: () => {
        return getStorage().sort((a, b) => b.lastModified - a.lastModified);
    },

    /**
     * Save a diagram
     * @param {string} id 
     * @param {string} name 
     * @param {Array} nodes 
     * @param {Array} edges 
     */
    save: (id, name, nodes, edges) => {
        const list = getStorage();
        const now = Date.now();

        // Update Metadata Index
        const existingIndex = list.findIndex(d => d.id === id);
        if (existingIndex >= 0) {
            list[existingIndex] = { ...list[existingIndex], name, lastModified: now };
        } else {
            list.push({ id, name, lastModified: now });
        }
        setStorage(list);

        // Save Data
        const data = { id, name, nodes, edges, lastModified: now };
        localStorage.setItem(PREFIX + id, JSON.stringify(data));
        return data; // Return saved data
    },

    /**
     * Load a specific diagram
     * @param {string} id 
     * @returns {Object|null}
     */
    load: (id) => {
        try {
            const data = localStorage.getItem(PREFIX + id);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading diagram', e);
            return null;
        }
    },

    /**
     * Delete a diagram
     * @param {string} id 
     */
    delete: (id) => {
        const list = getStorage().filter(d => d.id !== id);
        setStorage(list);
        localStorage.removeItem(PREFIX + id);
    }
};
