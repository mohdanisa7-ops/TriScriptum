import React from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import ScriptureColumn from '../reader/ScriptureColumn.tsx';
import SearchResults from '../reader/SearchResults.tsx';
import NotebookPanel from '../reader/NotebookPanel.tsx';
import SearchBar from '../common/SearchBar.tsx';
import Home from './Home.tsx';

const DynamicLayout: React.FC = () => {
    const {
        error,
        isLoading,
        loadingMessage,
        setSearchQuery,
        searchQuery,
        viewMode,
        activeSources,
        setViewMode,
        homeNotebookOpen,
        setHomeNotebookOpen
    } = useScripture();

    React.useEffect(() => {
        console.log(`[Layout] homeNotebookOpen: ${homeNotebookOpen}, viewMode: ${viewMode}`);
    }, [homeNotebookOpen, viewMode]);

    if (isLoading) return (
        <div className="loading-overlay glass">
            <div className="loading-content">
                <p className="loading-main-text">Synchronizing Manuscript Data...</p>
                <p className="loading-sub-text">{loadingMessage}</p>
            </div>
        </div>
    );
    if (error) return <div className="error-overlay glass">Core Error: {error}</div>;

    if (viewMode === 'home') {
        return (
            <>
                <Home />
                {homeNotebookOpen && (
                    <div className="home-notebook-overlay" onClick={() => setHomeNotebookOpen(false)}>
                        <div className="overlay-content" onClick={e => e.stopPropagation()}>
                            <NotebookPanel />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="app-container">
            <header className="main-header glass">
                <div className="clickable-logo" onClick={() => setViewMode('home')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/assets/triscriptum_logo.svg" alt="TriScriptum Logo" style={{ height: '32px' }} />
                    <h1 style={{ fontSize: '1.2rem', margin: 0 }}>TriScriptum</h1>
                </div>
                <div className="header-actions">
                    <SearchBar onSearch={setSearchQuery} />
                    {searchQuery && <button className="clear-search-v2" onClick={() => setSearchQuery('')}>×</button>}
                    <button
                        className="mobile-notebook-trigger"
                        onClick={() => {
                            console.log('[Layout] Toggle Mobile Notebook');
                            setHomeNotebookOpen(!homeNotebookOpen);
                        }}
                    >
                        {homeNotebookOpen ? 'Close' : 'Notes'}
                    </button>
                </div>
            </header>

            <main className="main-layout-body">
                <div className="column-grid" style={{ "--col-count": activeSources.filter(s => s !== 'notebook').length } as React.CSSProperties}>
                    {searchQuery && <SearchResults />}
                    {activeSources.filter(s => s !== 'notebook').map(sourceId => {
                        return (
                            <div key={sourceId} className="pane-glass glass">
                                <ScriptureColumn
                                    sourceId={sourceId as any}
                                    title={sourceId === 'torah' ? 'Torah' : sourceId === 'bible' ? 'Bible' : 'Quran'}
                                />
                            </div>
                        );
                    })}
                </div>
                {/* Keep inside main for desktop, CSS fixed for mobile */}
                <div className={`notebook-sidebar-container ${homeNotebookOpen ? 'active' : ''}`}>
                    <NotebookPanel />
                </div>
            </main>
        </div>
    );
};

export default DynamicLayout;
