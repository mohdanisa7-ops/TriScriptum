import React, { useState, useRef, useEffect } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';
import type { AiExplanationMode } from '../../types';

const ResearchConsole: React.FC = () => {
    const {
        currentAnalysisId,
        chatHistory,
        addChatMessage,
        aiMode,
        setAiMode,
        selectedWord,
        selectWord,
        isLoading
    } = useScripture();

    const [activeTab, setActiveTab] = useState<'chat' | 'linguistics' | 'sources'>('chat');
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedWord) setActiveTab('linguistics');
    }, [selectedWord]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, activeTab]);

    const handleSendMessage = () => {
        if (!input.trim()) return;
        const id = currentAnalysisId || 'general_research';

        addChatMessage(id, { role: 'user', content: input });
        setInput('');

        // Provide a general-purpose simulation
        setTimeout(() => {
            const lowerInput = input.toLowerCase();
            let response = '';

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                response = "Hello! I'm your AI Research Assistant. How can I help you explore the scriptures or your research documents today?";
            } else if (lowerInput.includes('moses')) {
                response = "Moses is a foundational figure across scriptural traditions. In the Torah, he leads the Exodus; in the Quran, he is often cited for his resilience. Would you like to see specific verses about his journey?";
            } else if (lowerInput.includes('who are you') || lowerInput.includes('what can you do')) {
                response = "I'm a general-purpose AI designed to help you navigate scriptures, analyze linguistic roots, and organize your research. You can ask me about historical context, specific figures, or for summaries of your notes.";
            } else if (lowerInput.includes('jesus') || lowerInput.includes('christ')) {
                response = "Jesus is central to the New Testament and is also highly respected in Islamic tradition as a major prophet. I can help you compare these perspectives if you're interested.";
            } else {
                response = `That's an interesting question about "${input}". While I'm looking through the available data, I can say that this theme often intersects with various historical and theological perspectives. What specific aspect would you like to dive into?`;
            }

            addChatMessage(id, {
                role: 'assistant',
                content: response
            });
        }, 1000);
    };

    if (isLoading) return <div className="console-loading">Finding answers...</div>;

    return (
        <section className="research-console glass">
            <div className="console-trigger">
                <div className={`console-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Assistant</div>
                <div className={`console-tab ${activeTab === 'linguistics' ? 'active' : ''}`} onClick={() => setActiveTab('linguistics')}>Lexicon</div>
                <div className={`console-tab ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>Sources</div>
            </div>

            <div className="console-body">
                {activeTab === 'chat' ? (
                    <div className="console-chat-area">
                        <div className="chat-messages-scroll premium-scroll">
                            <div className="system-greeting">◈ AI ASSISTANT READY</div>
                            {(chatHistory[currentAnalysisId || 'general_research'] || []).map(msg => (
                                <div key={msg.id} className={`chat-bubble-unified ${msg.role}`}>
                                    <div className="msg-content">
                                        {msg.role === 'assistant'
                                            ? msg.content.split(/(\[https?:\/\/.*?\])/).map((p, i) => {
                                                if (p.startsWith('[http')) {
                                                    const clean = p.slice(1, -1);
                                                    const [url, ...descParts] = clean.split(':');
                                                    const desc = descParts.join(':').trim() || url;
                                                    return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="citation-chip">{desc}</a>;
                                                }
                                                return <p key={i} className="formatted-msg-part">{p}</p>;
                                            })
                                            : msg.content
                                        }
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                        <div className="chat-input-row">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Ask anything..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button className="send-btn-v2" onClick={handleSendMessage}>Ask</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="console-tool-panel">
                        {activeTab === 'linguistics' ? (
                            <div className="linguistics-mode-v2">
                                {selectedWord ? (
                                    <div className="linguistic-focus-view">
                                        <label className="f-tag">Semantic Analysis</label>
                                        <h3 className="focus-term">{selectedWord.word}</h3>
                                        <div className="lex-mini-grid">
                                            {selectedWord.lexicon ? (
                                                <>
                                                    <div className="lex-card"><label>Root Origin</label><p>{selectedWord.lexicon.root}</p></div>
                                                    <div className="lex-card"><label>Definition</label><p>{selectedWord.lexicon.definition}</p></div>
                                                </>
                                            ) : (
                                                <div className="lex-fallback glass">
                                                    <p>No entry in local database.</p>
                                                    <button
                                                        className="ai-analyze-btn"
                                                        onClick={() => {
                                                            const id = currentAnalysisId || 'general_research';
                                                            setActiveTab('chat');
                                                            addChatMessage(id, { role: 'user', content: `Analyze the root and meaning of the word "${selectedWord.word}"` });
                                                            setTimeout(() => {
                                                                addChatMessage(id, {
                                                                    role: 'assistant',
                                                                    content: `Based on a linguistic analysis of "${selectedWord.word}", its root appears to be shared across several Ancient Near Eastern traditions. In this context, it often refers to ${selectedWord.word.toLowerCase().includes('spirit') ? 'the breath of life or divine inspiration' : 'a core thematic concept'}.`
                                                                });
                                                            }, 800);
                                                        }}
                                                    >
                                                        ◈ Request AI Analysis
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button className="clear-link" onClick={() => selectWord(null)}>Clear Analysis</button>
                                    </div>
                                ) : (
                                    <div className="empty-tool-state">
                                        <p>Select any word in the scripture to perform an automated root analysis.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="sources-mode-v2">
                                <div className="source-list-v2">
                                    <div className="source-item active">📜 MS: TORAH-01 (HEBREW)</div>
                                    <div className="source-item active">✞ MS: BIBLE-WEB (GREEK/ENG)</div>
                                    <div className="source-item active">☾ MS: QURAN-CLASSICAL (ARABIC)</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Standard chatbot footer */}
            </div>
        </section>
    );
};

export default ResearchConsole;
