import React, { useRef, useEffect } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import VerseList from './VerseList.tsx';

interface ScriptureColumnProps {
    sourceId: 'torah' | 'bible' | 'quran';
    title: string;
}

const ScriptureColumn: React.FC<ScriptureColumnProps> = ({ sourceId, title }) => {
    const { [sourceId]: data, selection, setSelection, closeSource, targetVerseId, setTargetVerseId } = useScripture();
    const containerRef = useRef<HTMLDivElement>(null);

    const currentSelection = selection[sourceId];
    const books = data || [];
    const currentBook = books[currentSelection.book];
    const chapters = currentBook?.chapters || [];
    const currentChapter = chapters[currentSelection.chapter];
    const currentVerses = currentChapter?.verses || [];

    const availableTranslations = currentVerses[0]
        ? Object.keys(currentVerses[0].translations)
        : [];

    const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelection(sourceId, { book: parseInt(e.target.value), chapter: 0 });
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelection(sourceId, { chapter: parseInt(e.target.value) });
    };

    const handleTranslationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelection(sourceId, { translation: e.target.value });
    };

    // Robust Teleport Logic
    useEffect(() => {
        if (!targetVerseId) return;

        // Only handle if this column is the target
        const isMySource = targetVerseId.startsWith(sourceId.toUpperCase());
        if (!isMySource) return;

        console.log(`[Col ${sourceId}] Teleport triggered for: ${targetVerseId}`);

        // Function to attempt scrolling
        const attemptScroll = () => {
            if (!containerRef.current) return false;

            // Try generic attribute selector first
            const verseEl = containerRef.current.querySelector(`[data-verse-id="${targetVerseId}"]`);

            if (verseEl) {
                console.log(`[Col ${sourceId}] 🎯 Found verse ${targetVerseId}. SCROLLING NOW.`);

                // 1. Smooth scroll to center
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 2. Fallback: Ensure it's visible if smooth scroll fails or is interrupted
                setTimeout(() => {
                    verseEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                }, 400);

                // Clear target after delay
                setTimeout(() => {
                    setTargetVerseId(null);
                }, 2000);
                return true;
            }
            return false;
        };

        // 1. Try immediately
        if (attemptScroll()) return;

        // 2. Set up a MutationObserver to watch for DOM changes (verses loading)
        // This is much better than polling
        const observer = new MutationObserver(() => {
            if (attemptScroll()) {
                observer.disconnect();
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current, {
                childList: true,
                subtree: true
            });
        }

        // 3. Backup polling (in case MutationObserver misses deep usage or something)
        // and timeout safety
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attemptScroll() || attempts > 50) { // 5 seconds max
                clearInterval(interval);
                observer.disconnect();
                if (attempts > 50) console.warn(`[Col ${sourceId}] Teleport timed out for ${targetVerseId}`);
            }
        }, 100);

        // Cleanup
        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, [targetVerseId, sourceId, setTargetVerseId]);

    return (
        <section className={`pane-glass glass scripture-column ${sourceId}-column`} ref={containerRef}>
            <header className="column-header">
                <div className="header-top">
                    <h2 className="premium-header-title">{title}</h2>
                    <div className="header-meta-actions">
                        <select
                            className="translation-select"
                            value={currentSelection.translation}
                            onChange={handleTranslationChange}
                        >
                            {availableTranslations.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <button className="close-column-btn" title="Close" onClick={() => closeSource(sourceId)}>×</button>
                    </div>
                </div>
                <div className="nav-controls">
                    <select value={currentSelection.book} onChange={handleBookChange} className="book-select-v2">
                        {books.map((book, i) => (
                            <option key={i} value={i}>{book.name}</option>
                        ))}
                    </select>
                    {sourceId !== 'quran' && (
                        <select value={currentSelection.chapter} onChange={handleChapterChange} className="chapter-select-v2">
                            {chapters.map((_, i) => (
                                <option key={i} value={i}>Chapter {i + 1}</option>
                            ))}
                        </select>
                    )}
                </div>
            </header>
            <div className="scroll-container premium-scroll">
                <VerseList
                    verses={currentVerses}
                    sourceId={sourceId}
                    translationKey={currentSelection.translation}
                />
            </div>
        </section>
    );
};

export default ScriptureColumn;
