import { useState, useCallback } from 'react';

export const useHistory = (initialState) => {
    const [state, setState] = useState(initialState);
    const [history, setHistory] = useState([initialState]);
    const [pointer, setPointer] = useState(0);

    const setWithHistory = useCallback((newState) => {
        const value = typeof newState === 'function' ? newState(state) : newState;
        
        // If the new value is same as current, don't add to history
        if (JSON.stringify(value) === JSON.stringify(state)) return;

        const newHistory = history.slice(0, pointer + 1);
        newHistory.push(value);
        
        // Limit history size to 50
        if (newHistory.length > 50) newHistory.shift();
        
        setHistory(newHistory);
        setPointer(newHistory.length - 1);
        setState(value);
    }, [state, history, pointer]);

    const undo = useCallback(() => {
        if (pointer > 0) {
            const newPointer = pointer - 1;
            setPointer(newPointer);
            setState(history[newPointer]);
        }
    }, [pointer, history]);

    const redo = useCallback(() => {
        if (pointer < history.length - 1) {
            const newPointer = pointer + 1;
            setPointer(newPointer);
            setState(history[newPointer]);
        }
    }, [pointer, history]);

    return [state, setWithHistory, undo, redo, pointer > 0, pointer < history.length - 1];
};
