import React from 'react';
import { VerseItem } from './VerseItem.tsx';
import type { Verse } from '../../types';

interface VerseListProps {
    verses: Verse[];
    sourceId: string;
    translationKey: string;
}

const VerseList: React.FC<VerseListProps> = ({ verses, sourceId, translationKey }) => {
    return (
        <div className="verse-list">
            {verses.map((verse) => (
                <div key={verse.id} data-verse-id={verse.id}>
                    <VerseItem
                        verse={verse}
                        sourceId={sourceId}
                        translationKey={translationKey}
                    />
                </div>
            ))}
        </div>
    );
};

export default VerseList;
