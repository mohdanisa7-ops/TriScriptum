import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ScriptureData, ScriptureState, SelectionState, SearchResult, ViewMode, ResearchDocument, TimelineEvent, ResearchNote } from '../types';

interface ScriptureContextType extends ScriptureState {
    selection: SelectionState;
    setSelection: (source: 'torah' | 'bible' | 'quran', selection: Partial<SelectionState['torah']>) => void;
    setSearchQuery: (query: string) => void;
    syncEnabled: boolean;
    setSyncEnabled: (enabled: boolean) => void;
    setViewMode: (mode: ViewMode) => void;
    openSource: (source: 'torah' | 'bible' | 'quran' | 'timeline' | 'notebook') => void;
    closeSource: (source: 'torah' | 'bible' | 'quran' | 'library' | 'timeline' | 'notebook', keepOne?: boolean) => void;
    uploadDocument: (doc: ResearchDocument) => void;
    setActiveDocument: (id: string | null) => void;
    setTimelineSettings: (settings: Partial<ScriptureState['timelineSettings']>) => void;
    addNote: (title: string) => void;
    updateNote: (id: string, content: string) => void;
    deleteNote: (id: string) => void;
    setActiveNote: (id: string | null) => void;
    targetVerseId: string | null;
    setTargetVerseId: (id: string | null) => void;
    jumpToVerse: (id: string) => void;
    homeNotebookOpen: boolean;
    setHomeNotebookOpen: (open: boolean) => void;
    searchFilter: 'all' | 'torah' | 'bible' | 'quran';
    setSearchFilter: (filter: 'all' | 'torah' | 'bible' | 'quran') => void;
}

const ScriptureContext = createContext<ScriptureContextType | undefined>(undefined);

export const ScriptureProvider = ({ children }: { children: ReactNode }) => {
    // Core data state
    const [coreData, setCoreData] = useState<{
        torah: ScriptureData | null;
        bible: ScriptureData | null;
        quran: ScriptureData | null;
        isLoading: boolean;
        loadingMessage: string;
        error: string | null;
    }>({
        torah: null,
        bible: null,
        quran: null,
        isLoading: true,
        loadingMessage: 'Initializing Manuscript Data...',
        error: null,
    });

    // UI/Research state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [activeSources, setActiveSources] = useState<('torah' | 'bible' | 'quran' | 'library' | 'timeline' | 'notebook')[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [library, setLibrary] = useState<ResearchDocument[]>([
        {
            id: 'local_bible_exp',
            title: "Bible Explained (Local Archive)",
            type: 'secondary',
            tags: ["Local", "Commentary", "Bible"],
            snippets: [],
            path: "C:\\Users\\mohda\\Downloads\\Bible Explained"
        },
        {
            id: 'local_quran_exp',
            title: "Quran Explained (Local Archive)",
            type: 'secondary',
            tags: ["Local", "Commentary", "Quran"],
            snippets: [],
            path: "C:\\Users\\mohda\\Downloads\\Quran Explained"
        }
    ]);
    const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [timelineSettings, setTimelineSettingsState] = useState({
        showTorah: true,
        showBible: true,
        showQuran: true,
        showArchaeology: true
    });
    const [notes, setNotes] = useState<ResearchNote[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [targetVerseId, setTargetVerseId] = useState<string | null>(null);
    const [homeNotebookOpen, setHomeNotebookOpen] = useState(false);
    const [searchFilter, setSearchFilter] = useState<'all' | 'torah' | 'bible' | 'quran'>('all');

    const [selection, setSelectionState] = useState<SelectionState>({
        torah: { book: 0, chapter: 0, translation: 'WEB' },
        bible: { book: 0, chapter: 0, translation: 'WEB' },
        quran: { book: 0, chapter: 0, translation: 'SAHIH' },
    });

    // ... (CRUD Handlers omitted for brevity) ...

    const addNote = (title: string) => {
        const newNote: ResearchNote = {
            id: Date.now().toString(),
            title,
            content: '',
            linkedReferences: [],
            versions: []
        };
        setNotes(prev => [...prev, newNote]);
        setActiveNoteId(newNote.id);
    };

    const updateNote = (id: string, content: string) => {
        setNotes(prev => prev.map(n => {
            if (n.id !== id) return n;
            const idRegex = /(TORAH|BIBLE|QURAN)_[A-Z]+_\d+_\d+/g;
            const refs = Array.from(content.matchAll(idRegex)).map(m => m[0]);
            const nextVersions = [...n.versions];
            if (n.content && n.content !== content) {
                nextVersions.push({ content: n.content, timestamp: Date.now() });
            }
            return { ...n, content, linkedReferences: Array.from(new Set(refs)), versions: nextVersions.slice(-10) };
        }));
    };

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (activeNoteId === id) setActiveNoteId(null);
    };

    const setActiveNote = (id: string | null) => setActiveNoteId(id);

    const setTimelineSettings = (s: Partial<ScriptureState['timelineSettings']>) => setTimelineSettingsState(prev => ({ ...prev, ...s }));

    const uploadDocument = (doc: ResearchDocument) => setLibrary(prev => [...prev, doc]);
    const setActiveDocument = (id: string | null) => { setActiveDocumentId(id); if (id) setViewMode('reader'); };

    const jumpToVerse = (id: string) => {
        // ... (Teleport logic same as before) ...
        let normalizedId = id.trim();
        console.log(`[Teleport] Requested ID/Link: "${normalizedId}"`);

        // Ultra-robust Regex for Shorthand
        // e.g. "B Genesis 1:1", "T Gen 1 1", "Q 2 255"
        const shorthandMatch = normalizedId.match(/^([TBQ])\s*([A-Za-z0-9_-]+)(?:\s+)?(\d+)?(?::(\d+))?$/i);

        if (shorthandMatch) {
            const [_, prefix, bookPart, chapPart, versePart] = shorthandMatch;
            const source = prefix.toUpperCase() === 'T' ? 'TORAH' : prefix.toUpperCase() === 'B' ? 'BIBLE' : 'QURAN';

            if (source === 'QURAN') {
                const surahNum = bookPart;
                const verseNum = versePart || chapPart || '1';
                normalizedId = `QURAN_SURAH_${surahNum}_${verseNum}`;
            } else {
                const bookSlug = bookPart.toUpperCase();
                const chap = chapPart || '1';
                normalizedId = `${source}_${bookSlug}_${chap}${versePart ? '_' + versePart : ''}`;
            }
        }

        const parts = normalizedId.split('_');
        const sourceStr = parts[0].toLowerCase() as 'torah' | 'bible' | 'quran';

        if (!activeSources.includes(sourceStr)) {
            console.log(`[Teleport] Activating source: ${sourceStr}`);
            openSource(sourceStr);
        }

        const bookData = coreData[sourceStr];
        if (bookData) {
            let bookIdx = -1;
            let chapIdx = -1;

            if (sourceStr === 'quran') {
                const surahNum = parts[2];
                const targetSlug = `surah_${surahNum}`.toLowerCase();
                bookIdx = bookData.findIndex(b => b.slug.toLowerCase() === targetSlug);
                chapIdx = 0;
            } else {
                const bookSlug = parts[1].toLowerCase();
                bookIdx = bookData.findIndex(b => b.slug.toLowerCase() === bookSlug);
                chapIdx = (parseInt(parts[2]) || 1) - 1;
            }

            if (bookIdx !== -1) {
                setSelection(sourceStr, { book: bookIdx, chapter: Math.max(0, chapIdx) });
            } else {
                console.error(`[Teleport] ERROR: Could not find book/surah index for ${normalizedId}`);
            }
        }

        // Reset target first to trigger change detection if same verse is clicked
        setTargetVerseId(null);

        // Short delay to allow React to process the viewMode/activeSources changes
        setTimeout(() => {
            console.log(`[Teleport] 🚀 Firing targetVerseId: ${normalizedId}`);
            setTargetVerseId(normalizedId);
        }, 150);
    };

    const openSource = (source: 'torah' | 'bible' | 'quran' | 'timeline' | 'notebook') => {
        setActiveSources(prev => prev.includes(source) ? prev : [...prev, source]);
        setViewMode('reader');
    };

    const closeSource = (source: 'torah' | 'bible' | 'quran' | 'library' | 'timeline' | 'notebook', keepOne = false) => {
        setActiveSources(prev => {
            const next = prev.filter(s => s !== source);
            if (next.length === 0 && !keepOne) setViewMode('home');
            return next;
        });
    };

    const setSelection = (source: 'torah' | 'bible' | 'quran', newSel: Partial<SelectionState['torah']>) => {
        setSelectionState(prev => {
            const updated = { ...prev[source], ...newSel };
            const next = { ...prev, [source]: updated };
            if (syncEnabled && newSel.chapter !== undefined) {
                return {
                    torah: { ...prev.torah, chapter: newSel.chapter },
                    bible: { ...prev.bible, chapter: newSel.chapter },
                    quran: { ...prev.quran, chapter: newSel.chapter },
                    [source]: updated
                };
            }
            return next;
        });
    };


    useEffect(() => {
        const loadData = async () => {
            const updateStatus = (msg: string) => {
                setCoreData(prev => ({ ...prev, loadingMessage: msg }));
            };

            try {
                // Initialize notes from localStorage
                const savedNotes = localStorage.getItem('scripture_research_notes');
                if (savedNotes) {
                    try { setNotes(JSON.parse(savedNotes)); } catch (e) { }
                }

                // Initialize Timeline Settings if saved
                // Initialize Search Filter if saved? No, keep default 'all'

                const sources = [
                    { key: 'torah', url: '/data/torah.json', label: 'Torah' },
                    { key: 'bible', url: '/data/bible.json', label: 'Bible' },
                    { key: 'quran', url: '/data/quran.json', label: 'Quran' },
                    { key: 'timeline', url: '/data/timeline.json', label: 'Historical Timeline' }
                ];

                const loaded: any = {};

                for (const src of sources) {
                    updateStatus(`Fetching ${src.label}...`);
                    const res = await fetch(src.url);
                    if (!res.ok) throw new Error(`Failed to load ${src.label}`);

                    updateStatus(`Parsing ${src.label} (please wait)...`);
                    const data = await res.json();

                    if (src.key === 'timeline') setTimeline(data);
                    else loaded[src.key] = data;
                }

                setCoreData({
                    ...loaded,
                    isLoading: false,
                    loadingMessage: 'Complete',
                    error: null
                });
            } catch (err) {
                console.error('Core Load Error:', err);
                setCoreData(prev => ({
                    ...prev,
                    isLoading: false,
                    error: `Network/Memory Error: ${(err as Error).message}. Try refreshing.`
                }));
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) { setSearchResults([]); setIsSearching(false); return; }
        setIsSearching(true);
        const results: SearchResult[] = [];
        const query = searchQuery.toLowerCase();

        // Filter sources based on searchFilter
        const sources: { data: ScriptureData | null, id: 'torah' | 'bible' | 'quran' }[] = [];

        if (searchFilter === 'all' || searchFilter === 'torah') sources.push({ data: coreData.torah, id: 'torah' });
        if (searchFilter === 'all' || searchFilter === 'bible') sources.push({ data: coreData.bible, id: 'bible' });
        if (searchFilter === 'all' || searchFilter === 'quran') sources.push({ data: coreData.quran, id: 'quran' });

        sources.forEach(s => {
            if (!s.data) return;
            s.data.forEach((book, bIdx) => {
                book.chapters.forEach((chapter, cIdx) => {
                    chapter.verses.forEach((verse, vIdx) => {
                        Object.entries(verse.translations).forEach(([tKey, tText]) => {
                            if (tText.toLowerCase().includes(query)) {
                                results.push({
                                    reference: {
                                        sourceId: s.id,
                                        bookSlug: book.slug,
                                        bookIndex: bIdx,
                                        chapterIndex: cIdx,
                                        verseIndex: vIdx
                                    },
                                    text: tText,
                                    translationKey: tKey
                                });
                            }
                        });
                    });
                });
            });
        });

        // Sort by source priority anyway for better display
        const sortedResults = results.sort((a, b) => {
            const priority = { torah: 1, bible: 2, quran: 3 };
            return (priority[a.reference.sourceId] || 99) - (priority[b.reference.sourceId] || 99);
        });

        setSearchResults(sortedResults.slice(0, 100));
        setIsSearching(false);
    }, [searchQuery, coreData.torah, coreData.bible, coreData.quran, searchFilter]);

    useEffect(() => {
        if (!coreData.isLoading) {
            localStorage.setItem('scripture_research_notes', JSON.stringify(notes));
        }
    }, [notes, coreData.isLoading]);

    return (
        <ScriptureContext.Provider value={{
            ...coreData,
            searchQuery, setSearchQuery, searchResults, isSearching, syncEnabled, setSyncEnabled,
            activeSources, viewMode, setViewMode, library,
            activeDocumentId, timeline, timelineSettings,
            setTimelineSettings, notes, activeNoteId, selection, setSelection,
            addNote, updateNote, deleteNote, setActiveNote,
            openSource, closeSource, uploadDocument, setActiveDocument,
            targetVerseId, setTargetVerseId, jumpToVerse,
            homeNotebookOpen, setHomeNotebookOpen,
            searchFilter, setSearchFilter
        } as any}>
            {children}
        </ScriptureContext.Provider>
    );
};

export const useScripture = () => {
    const context = useContext(ScriptureContext);
    if (!context) throw new Error('useScripture must be used within provider');
    return context;
};
