export interface VerseMetadata {
    lang: string;
    dating?: string;
    themes: string[];
}

export interface Verse {
    id: string; // Permanent ID: SOURCE_BOOK_CH_V
    number: number;
    translations: Record<string, string>;
    meta: VerseMetadata;
}

export interface Chapter {
    number: number;
    verses: Verse[];
}

export interface Book {
    name: string;
    slug: string;
    chapters: Chapter[];
}

export type ScriptureData = Book[];

export interface ScriptureReference {
    sourceId: 'torah' | 'bible' | 'quran';
    bookSlug: string;
    bookIndex: number;
    chapterIndex: number;
    verseIndex?: number;
}

export type AnalysisCategory =
    | 'Direct Parallel'
    | 'Thematic Similarity'
    | 'Narrative Continuation'
    | 'Theological Divergence'
    | 'Moral Analogy';

export interface ParallelConnection {
    targetId: string;
    category: AnalysisCategory;
    explanation: string;
    citation: string;
}

export type ViewMode = 'home' | 'reader';

export interface DocumentSnippet {
    page: number;
    text: string;
    linkedVerseIds: string[];
}

export interface ResearchDocument {
    id: string;
    title: string;
    type: 'primary' | 'secondary';
    tags: string[];
    snippets: DocumentSnippet[];
    path?: string;
}

export interface LexiconEntry {
    root: string;
    language: 'Hebrew' | 'Greek' | 'Arabic';
    definition: string;
    literalMeaning: string;
    theologicalInterpretation: string;
    occurrencesCount: number;
}

export interface SelectedWord {
    word: string;
    verseId: string;
    lexicon?: LexiconEntry;
}

export type AiExplanationMode =
    | 'Academic'
    | 'Timeline'
    | 'Comparative'
    | 'Simplified'
    | 'Critical';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface TimelineEvent {
    id: string;
    year: number;
    title: string;
    description: string;
    source: 'torah' | 'bible' | 'quran' | 'archaeology';
    linkedVerseIds: string[];
    conflictId?: string;
}

export interface NoteVersion {
    content: string;
    timestamp: number;
}

export interface ResearchNote {
    id: string;
    title: string;
    content: string;
    linkedReferences: string[];
    versions: NoteVersion[];
}

export interface SearchResult {
    reference: ScriptureReference;
    text: string;
    translationKey: string;
}

export interface SelectionState {
    torah: { book: number; chapter: number; translation: string };
    bible: { book: number; chapter: number; translation: string };
    quran: { book: number; chapter: number; translation: string };
}

export interface ScriptureState {
    torah: ScriptureData | null;
    bible: ScriptureData | null;
    quran: ScriptureData | null;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    searchQuery: string;
    searchResults: SearchResult[];
    isSearching: boolean;
    currentAnalysisId: string | null;
    activeSources: ('torah' | 'bible' | 'quran' | 'library' | 'timeline' | 'notebook')[];
    viewMode: ViewMode;
    library: ResearchDocument[];
    activeDocumentId: string | null;
    selectedWord: SelectedWord | null;
    aiMode: AiExplanationMode;
    chatHistory: Record<string, ChatMessage[]>;
    timeline: TimelineEvent[];
    timelineSettings: {
        showTorah: boolean;
        showBible: boolean;
        showQuran: boolean;
        showArchaeology: boolean;
    };
    notes: ResearchNote[];
    activeNoteId: string | null;
}
