import React, { useMemo } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import type { TimelineEvent } from '../../types';

const TimelinePane: React.FC = () => {
    const { timeline, timelineSettings, setTimelineSettings, setSelection, openSource, closeSource } = useScripture();

    const filteredEvents = useMemo(() => {
        return timeline.filter(e => {
            if (e.source === 'torah' && !timelineSettings.showTorah) return false;
            if (e.source === 'bible' && !timelineSettings.showBible) return false;
            if (e.source === 'quran' && !timelineSettings.showQuran) return false;
            if (e.source === 'archaeology' && !timelineSettings.showArchaeology) return false;
            return true;
        }).sort((a, b) => a.year - b.year);
    }, [timeline, timelineSettings]);

    const handleEventClick = (event: TimelineEvent) => {
        if (event.linkedVerseIds.length > 0) {
            const firstRef = event.linkedVerseIds[0];
            const parts = firstRef.split('_');
            const sourceId = parts[0].toLowerCase() as any;
            const chapter = parseInt(parts[parts.length - 2]) - 1;

            openSource(sourceId);
            setSelection(sourceId, { chapter });
        }
    };

    return (
        <div className="pane-glass glass scripture-column timeline-pane">
            <header className="column-header pane-header">
                <div className="header-top">
                    <h2 className="premium-header-title">Chronological Stream</h2>
                    <button className="close-column-btn" onClick={() => closeSource('timeline' as any)}>×</button>
                </div>
                <div className="pane-filters">
                    <span className={`f-chip ${timelineSettings.showTorah ? 'torah active' : ''}`} onClick={() => setTimelineSettings({ showTorah: !timelineSettings.showTorah })}>Torah</span>
                    <span className={`f-chip ${timelineSettings.showBible ? 'bible active' : ''}`} onClick={() => setTimelineSettings({ showBible: !timelineSettings.showBible })}>Bible</span>
                    <span className={`f-chip ${timelineSettings.showQuran ? 'quran active' : ''}`} onClick={() => setTimelineSettings({ showQuran: !timelineSettings.showQuran })}>Quran</span>
                    <span className={`f-chip ${timelineSettings.showArchaeology ? 'arch active' : ''}`} onClick={() => setTimelineSettings({ showArchaeology: !timelineSettings.showArchaeology })}>Archaeology</span>
                </div>
            </header>

            <div className="scroll-container premium-scroll">
                <div className="timeline-stream-container">
                    {filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className={`timeline-node ${event.conflictId ? 'conflict' : ''}`}
                            onClick={() => handleEventClick(event)}
                        >
                            <div className="node-content glass clickable">
                                <header className="node-header">
                                    <span className="node-year">{Math.abs(event.year)} {event.year < 0 ? 'BCE' : 'CE'}</span>
                                    <span className={`source-indicator ${event.source}`}>{event.source[0].toUpperCase()}</span>
                                </header>
                                <h3 className="node-title">{event.title}</h3>
                                <p className="node-desc">{event.description}</p>
                                {event.conflictId && (
                                    <div className="tension-badge">
                                        <span className="icon">⚠</span> Chronological Tension Detected
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="ai-stream-analysis glass">
                        <label className="gold-label">AI Chronology Intelligence</label>
                        <p className="ai-insight">A significant narrative overlap is detected between the Mosaic Exodus and Merneptah records. <strong>Discrepancy:</strong> 238 years.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelinePane;
