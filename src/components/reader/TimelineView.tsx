import React, { useMemo } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import type { TimelineEvent } from '../../types';

const TimelineView: React.FC = () => {
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
        <div className="timeline-column scripture-column">
            <header className="column-header timeline-header">
                <div className="header-top">
                    <h2>Unified Chronology</h2>
                    <button className="close-column-btn" onClick={() => closeSource('timeline' as any)}>×</button>
                </div>
                <div className="timeline-toggles">
                    <button
                        className={`toggle-pill torah ${timelineSettings.showTorah ? 'active' : ''}`}
                        onClick={() => setTimelineSettings({ showTorah: !timelineSettings.showTorah })}
                    >📜 Torah</button>
                    <button
                        className={`toggle-pill bible ${timelineSettings.showBible ? 'active' : ''}`}
                        onClick={() => setTimelineSettings({ showBible: !timelineSettings.showBible })}
                    >✞ Bible</button>
                    <button
                        className={`toggle-pill quran ${timelineSettings.showQuran ? 'active' : ''}`}
                        onClick={() => setTimelineSettings({ showQuran: !timelineSettings.showQuran })}
                    >☾ Quran</button>
                    <button
                        className={`toggle-pill archaeology ${timelineSettings.showArchaeology ? 'active' : ''}`}
                        onClick={() => setTimelineSettings({ showArchaeology: !timelineSettings.showArchaeology })}
                    >⚖ Archaeology</button>
                </div>
            </header>

            <div className="scroll-container timeline-body">
                <div className="timeline-axis">
                    {filteredEvents.map((event, idx) => (
                        <div
                            key={event.id}
                            className={`timeline-event-card ${event.source} ${event.conflictId ? 'has-conflict' : ''}`}
                            onClick={() => handleEventClick(event)}
                        >
                            <div className="event-year">
                                {Math.abs(event.year)} {event.year < 0 ? 'BCE' : 'CE'}
                                {event.conflictId && <span className="conflict-tag" title="Chronological Tension Identified">⚠ TENSION</span>}
                            </div>
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>
                            <div className="event-footer">
                                <span className="source-tag">{event.source.toUpperCase()}</span>
                                <span className="linked-count">{event.linkedVerseIds.length} Linked Verses</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ai-timeline-insights">
                    <h4>AI Chronology Analysis</h4>
                    <div className="insight-card overlap">
                        <p><strong>Overlap Flag:</strong> The dating of "The Exodus" diverges by ~200 years between traditional Torah chronology and late-Bronze Age archaeological findings. [ARCH_MERNEPTAH_1208]</p>
                    </div>
                    <div className="insight-card gap">
                        <p><strong>Gap Flag:</strong> Silent period of ~400 years noted between Malachi (Bible) and the arrival of the Gospel narratives.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
