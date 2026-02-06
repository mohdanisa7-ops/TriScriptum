import React from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import type { SearchResult } from '../../types';

const SearchResults: React.FC = () => {
    const { searchResults, setSearchQuery, isSearching, torah, bible, quran, searchQuery, jumpToVerse } = useScripture();

    const getBookName = (sourceId: string, index: number) => {
        const sourceData = sourceId === 'torah' ? torah : sourceId === 'bible' ? bible : quran;
        return sourceData?.[index]?.name || 'Unknown Book';
    };

    const getBookSlug = (sourceId: string, index: number) => {
        const sourceData = sourceId === 'torah' ? torah : sourceId === 'bible' ? bible : quran;
        return sourceData?.[index]?.slug || '';
    };

    const handleResultClick = (result: SearchResult) => {
        const src = result.reference.sourceId; // 'torah', 'bible', or 'quran'
        const bookSlug = getBookSlug(src, result.reference.bookIndex);
        const chapter = result.reference.chapterIndex + 1;
        const verse = (result.reference.verseIndex ?? 0) + 1;

        let id = '';
        if (src === 'quran') {
            // Quran Link Style: Q SURAH_NUM:VERSE
            const surahNum = bookSlug.split('_')[1] || (result.reference.bookIndex + 1);
            id = `Q ${surahNum}:${verse}`;
        } else {
            // Bible/Torah Link Style: T/B BookName Chapter:Verse
            // e.g. "T Genesis 1:1" or "B John 3:16"
            const prefix = src === 'torah' ? 'T' : 'B';
            const bookName = getBookName(src, result.reference.bookIndex);
            id = `${prefix} ${bookName} ${chapter}:${verse}`;
        }

        console.log('[SearchResults] Teleporting to:', id);

        // Clear search IMMEDIATELY so the search overlay closes
        setSearchQuery('');

        // Then invoke jumpToVerse after a brief delay to allow UI to update
        setTimeout(() => {
            jumpToVerse(id);
        }, 50);
    };

    if (isSearching) {
        return (
            <div className="search-status-overlay">
                <div className="search-loader"></div>
                <span>Scanning Ancient Manuscripts...</span>
            </div>
        );
    }

    if (!searchQuery || searchQuery.length < 3) return null;

    if (searchResults.length === 0) {
        return (
            <div className="search-status-overlay empty">
                <span className="icon">◈</span>
                <p>No matches found across the collections.</p>
            </div>
        );
    }

    // Group results by source
    const groupedResults = searchResults.reduce((acc, res) => {
        const sourceId = res.reference.sourceId;
        if (!acc[sourceId]) acc[sourceId] = [];
        acc[sourceId].push(res);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    return (
        <div className="search-results-panel active">
            <header className="results-header">
                <h3><span className="icon">⌕</span> {searchResults.length} Match{searchResults.length > 1 ? 'es' : ''} Found</h3>
                <button className="close-results-btn" onClick={() => setSearchQuery('')}>×</button>
            </header>

            <div className="results-container">
                {Object.entries(groupedResults).map(([sourceId, results]) => (
                    <div key={sourceId} className={`source-group ${sourceId}-group`}>
                        <div className="group-header">
                            <span className="source-label">{sourceId === 'torah' ? 'Torah' : sourceId === 'bible' ? 'Bible' : 'Quran'}</span>
                            <span className="count-badge">{results.length} Matches</span>
                        </div>
                        <div className="group-items">
                            {results.map((result, i) => (
                                <div key={i} className="search-result-item" onClick={() => handleResultClick(result)}>
                                    <div className="result-meta">
                                        <span className="ref-text">
                                            {getBookName(result.reference.sourceId, result.reference.bookIndex)} {result.reference.chapterIndex + 1}:{result.reference.verseIndex! + 1}
                                        </span>
                                        <span className="translation-tag">{result.translationKey}</span>
                                    </div>
                                    <p className="result-snippet" dangerouslySetInnerHTML={{
                                        __html: result.text.replace(new RegExp(searchQuery, 'gi'), (match) => `<mark>${match}</mark>`)
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;
