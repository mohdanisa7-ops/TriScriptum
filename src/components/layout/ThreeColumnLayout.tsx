import React from 'react';
import { useScripture } from '../../context/ScriptureContext';
import SearchBar from '../common/SearchBar';

import SearchResults from '../reader/SearchResults.tsx';
import AiResearchAssistant from '../reader/AiResearchAssistant.tsx';

interface LayoutProps {
    children: React.ReactNode;
}

const ThreeColumnLayout: React.FC<LayoutProps> = ({ children }) => {
    const { error, isLoading, setSearchQuery, searchQuery } = useScripture();

    if (isLoading) {
        return <div className="loading-overlay">Initializing Research Environment...</div>;
    }

    if (error) {
        return <div className="error-overlay">Hardware Error: {error}</div>;
    }

    return (
        <div className="app-container">
            <header className="main-header">
                <h1>Comparative Scripture Research App</h1>
                <div className="header-actions">
                    <SearchBar onSearch={setSearchQuery} />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>Clear Results</button>
                    )}
                </div>
            </header>
            <main className="main-layout-body">
                <div className="column-grid">
                    {searchQuery && <SearchResults />}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ThreeColumnLayout;
