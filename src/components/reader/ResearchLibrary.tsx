import React, { useState } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import type { ResearchDocument } from '../../types';

const ResearchLibrary: React.FC = () => {
    const { library, uploadDocument, setActiveDocument, activeDocumentId, closeSource } = useScripture();
    const [isUploading, setIsUploading] = useState(false);

    const handleMockUpload = () => {
        const mockDoc: ResearchDocument = {
            id: `doc_${Date.now()}`,
            title: "Archeological Survey of Southern Levant (Iron Age II)",
            type: 'secondary',
            tags: ["Archeology", "Iron Age", "Survey"],
            snippets: [
                {
                    page: 12,
                    text: "The presence of distinct pottery styles in the central highlands suggest a shift in pastoral patterns during the 11th century BCE, aligning with early narratives of domestic migration.",
                    linkedVerseIds: ["BIBLE_GENESIS_12_1", "TORAH_GENESIS_12_1"]
                },
                {
                    page: 45,
                    text: "Evidence for centralized grain storage in the Jezreel valley supports the existence of an organized administrative structure consistent with the unified monarchy era.",
                    linkedVerseIds: ["BIBLE_KINGS_1_4_7"]
                }
            ]
        };
        uploadDocument(mockDoc);
        setIsUploading(false);
    };

    const activeDoc = library.find(d => d.id === activeDocumentId);

    return (
        <div className="pane-glass glass research-library scripture-column">
            <header className="library-header column-header pane-header">
                <div className="header-top">
                    <h2 className="premium-header-title">Research Library</h2>
                    <button className="close-column-btn" onClick={() => closeSource('library' as any)}>×</button>
                </div>
                {!activeDoc && <button className="upload-btn-v2" onClick={() => setIsUploading(true)}>+ Ingest Document</button>}
            </header>

            {isUploading && (
                <div className="analysis-overlay animate-fade">
                    <div className="modal-content-premium glass">
                        <h3>Ingest Research Material</h3>
                        <p>Upload scholarly text for AI-assisted cross-referencing.</p>
                        <div className="upload-zone-v2" onClick={handleMockUpload}>
                            <span>Drop PDF here for metadata extraction</span>
                        </div>
                        <button className="cancel-pill" onClick={() => setIsUploading(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="scroll-container premium-scroll">
                {!activeDoc ? (
                    <div className="document-grid-v2">
                        {library.map(doc => (
                            <div key={doc.id} className={`doc-card-premium glass ${doc.type}`} onClick={() => setActiveDocument(doc.id)}>
                                <span className="doc-type-label">{doc.type}</span>
                                <h3 className="doc-title-v2">{doc.title}</h3>
                                <div className="doc-tag-row">
                                    {doc.tags.map(t => <span key={t} className="d-tag">{t}</span>)}
                                </div>
                                <div className="doc-meta-footer">
                                    {doc.path ? `Local Archive: ${doc.path.split('\\').pop()}` : `${doc.snippets.length} Grounded Snippets`}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="document-viewer-v2">
                        <button className="back-link" onClick={() => setActiveDocument(null)}>← Return to Library</button>
                        <div className="viewer-header-v2">
                            <span className="doc-type-label">{activeDoc.type}</span>
                            <h3 className="viewer-title">{activeDoc.title}</h3>
                        </div>
                        <div className="snippet-stream">
                            {activeDoc.snippets.map((snippet, idx) => (
                                <div key={idx} className="snippet-box-premium glass">
                                    <div className="snippet-p-num">Page {snippet.page}</div>
                                    <p className="snippet-body-text">{snippet.text}</p>
                                    <div className="snippet-link-row">
                                        {snippet.linkedVerseIds.map(id => (
                                            <span key={id} className="s-link-chip">{id.replace(/_/g, ' ')}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResearchLibrary;
