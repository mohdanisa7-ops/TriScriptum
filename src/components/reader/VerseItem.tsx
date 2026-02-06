import React, { useState } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import type { Verse } from '../../types';

interface VerseItemProps {
    verse: Verse;
    sourceId: string;
    translationKey: string;
}

export const VerseItem: React.FC<VerseItemProps> = ({ verse, sourceId, translationKey }) => {
    const { targetVerseId } = useScripture();
    const [showMetadata, setShowMetadata] = useState(false);
    const text = verse.translations[translationKey] || 'Text not available in this version.';

    const formatReference = (id: string) => {
        const parts = id.split('_');
        if (parts[0] === 'QURAN') {
            const surah = parts[2];
            const verse = parts[3];
            return `Q ${surah}:${verse}`;
        }
        const prefix = parts[0] === 'TORAH' ? 'T' : 'B';
        const book = parts[1].charAt(0) + parts[1].slice(1).toLowerCase();
        const chapter = parts[2];
        const vNum = parts[3];
        return `${prefix} ${book} ${chapter}:${vNum}`;
    };

    const isTarget = verse.id === targetVerseId;

    return (
        <div
            className={`verse-item-v2 ${sourceId}-verse ${isTarget ? 'teleport-flash' : ''}`}
            data-verse-id={verse.id}
        >
            <div className="verse-metadata-row">
                <span className="v-num">{verse.number}</span>
            </div>

            <div className="v-content-box" onClick={() => setShowMetadata(!showMetadata)}>
                <p className="v2-text">{text}</p>

                {showMetadata && (
                    <div className="v-info-tag glass">
                        <span className="tag-label">Manuscript Source:</span>
                        <span className="tag-value">{formatReference(verse.id)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
