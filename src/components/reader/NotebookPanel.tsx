import React, { useState, useRef, useEffect } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';

const NotebookPanel: React.FC = () => {
    const { notes, activeNoteId, addNote, updateNote, deleteNote, setActiveNote, closeSource, jumpToVerse, homeNotebookOpen, setHomeNotebookOpen } = useScripture();
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [showLinkPopover, setShowLinkPopover] = useState(false);
    const [linkRef, setLinkRef] = useState('');
    const [savedRange, setSavedRange] = useState<Range | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const activeNote = notes.find(n => n.id === activeNoteId);

    useEffect(() => {
        if (editorRef.current && activeNote && editorRef.current.innerHTML !== activeNote.content) {
            editorRef.current.innerHTML = activeNote.content;
        }
    }, [activeNoteId]);

    const handleAddNote = () => {
        if (newTitle.trim()) {
            addNote(newTitle);
            setNewTitle('');
            setIsAdding(false);
        }
    };

    const execCommand = (command: string, value: string = '', e?: React.MouseEvent) => {
        if (e) e.preventDefault(); // Critical for mobile focus retention
        document.execCommand(command, false, value);
        handleInput();
    };

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            setSavedRange(selection.getRangeAt(0));
        }
    };

    const handleInsertLink = () => {
        if (linkRef && savedRange) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedRange);

                const link = document.createElement('a');
                link.href = "#";
                link.className = "verse-link-node";
                link.dataset.ref = linkRef;
                link.textContent = selection.toString() || linkRef;

                savedRange.deleteContents();
                savedRange.insertNode(link);

                handleInput();
                setLinkRef('');
                setSavedRange(null);
                setShowLinkPopover(false);
            }
        }
    };

    const handleInput = () => {
        if (editorRef.current && activeNote) {
            updateNote(activeNote.id, editorRef.current.innerHTML);
        }
    };

    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('.verse-link-node') as HTMLElement;
        if (link) {
            e.preventDefault();
            const ref = link.getAttribute('data-ref');
            if (ref) jumpToVerse(ref);
        }
    };

    return (
        <div className="notebook-sidebar glass">
            <header className="column-header notebook-header pane-header">
                <div className="header-top">
                    <div className="perspective-selector">
                        <select
                            value={activeNoteId || ''}
                            onChange={(e) => {
                                if (e.target.value === 'new') {
                                    setIsAdding(true);
                                } else {
                                    setActiveNote(e.target.value);
                                }
                            }}
                        >
                            <option value="" disabled>Select Perspective...</option>
                            {notes.map(note => (
                                <option key={note.id} value={note.id}>{note.title}</option>
                            ))}
                            <option value="new">+ Create New Perspective...</option>
                        </select>
                    </div>
                    <button className="close-column-btn" onClick={() => {
                        if (homeNotebookOpen) setHomeNotebookOpen(false);
                        else closeSource('notebook');
                    }}>×</button>
                </div>

                {isAdding && (
                    <div className="new-note-popover glass animate-fade">
                        <input
                            type="text"
                            placeholder="Perspective Title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="popover-actions">
                            <button onClick={() => setIsAdding(false)}>Cancel</button>
                            <button className="save-note-btn" onClick={handleAddNote}>Save</button>
                        </div>
                    </div>
                )}
            </header>

            {activeNote ? (
                <div className="note-workbench-v3">
                    <div className="notebook-toolbar">
                        <div className="tool-group">
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('formatBlock', 'h2', e)}>H1</button>
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('formatBlock', 'h3', e)}>H2</button>
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('formatBlock', 'p', e)}>P</button>
                        </div>
                        <span className="divider">|</span>
                        <div className="tool-group">
                            <button className="toolbar-btn" style={{ fontWeight: 800 }} onMouseDown={(e) => execCommand('bold', '', e)}>B</button>
                            <button className="toolbar-btn" style={{ fontStyle: 'italic' }} onMouseDown={(e) => execCommand('italic', '', e)}>I</button>
                            <button className="toolbar-btn" style={{ textDecoration: 'underline' }} onMouseDown={(e) => execCommand('underline', '', e)}>U</button>
                        </div>
                        <span className="divider">|</span>
                        <div className="tool-group">
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('insertUnorderedList', '', e)}>• List</button>
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('insertOrderedList', '', e)}>1. List</button>
                        </div>
                        <span className="divider">|</span>
                        <div className="tool-group">
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('justifyLeft', '', e)}>L</button>
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('justifyCenter', '', e)}>C</button>
                            <button className="toolbar-btn" onMouseDown={(e) => execCommand('justifyRight', '', e)}>R</button>
                        </div>
                        <span className="divider">|</span>
                        <div className="tool-group">
                            <div className="link-tool-wrapper">
                                <button
                                    className={`toolbar-btn link-btn ${showLinkPopover ? 'active' : ''}`}
                                    onClick={() => {
                                        saveSelection();
                                        setShowLinkPopover(!showLinkPopover);
                                    }}
                                    title="Link a Verse"
                                >
                                    🔗 Link
                                </button>

                                {showLinkPopover && (
                                    <div className="link-popover glass animate-fade">
                                        <input
                                            type="text"
                                            placeholder="BIBLE_GEN_1_1..."
                                            value={linkRef}
                                            onChange={(e) => setLinkRef(e.target.value)}
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleInsertLink()}
                                        />
                                        <button onClick={handleInsertLink}>Insert</button>
                                    </div>
                                )}
                            </div>
                            <input
                                type="color"
                                className="color-picker"
                                onChange={(e) => execCommand('foreColor', e.target.value)}
                                title="Text Color"
                            />
                            <button className="toolbar-btn" onClick={() => deleteNote(activeNote.id)} title="Delete Perspective">🗑</button>
                        </div>
                    </div>
                    <div
                        ref={editorRef}
                        className="rich-editor premium-scroll"
                        contentEditable
                        onInput={handleInput}
                        onClick={handleEditorClick}
                        data-placeholder="Begin your scholarly synthesis here..."
                    />
                </div>
            ) : (
                <div className="empty-workbench">
                    <div className="w-icon">✍</div>
                    <p>Select or create a note to begin.</p>
                </div>
            )}
        </div>
    );
};

export default NotebookPanel;
