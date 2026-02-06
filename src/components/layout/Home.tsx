import React from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';

const Home: React.FC = () => {
    const { openSource, setViewMode, isLoading, error, setHomeNotebookOpen } = useScripture();

    if (isLoading) return <div className="loading-overlay glass">Setting up your workspace...</div>;
    if (error) return <div className="error-overlay glass">Something went wrong: {error}</div>;

    const modules = [
        { id: 'torah', title: 'The Torah', subtitle: 'Ancient Manuscripts', description: 'Genesis to Deuteronomy with interlinear support.', color: 'var(--accent-blue)' },
        { id: 'bible', title: 'The Bible', subtitle: 'Standard Collection', description: 'Comprehensive textual variants from various traditions.', color: 'var(--accent-gold)' },
        { id: 'quran', title: 'The Quran', subtitle: 'Arabic Revelation', description: 'Trilingual Sahih and Pickthall interpretations.', color: 'var(--accent-green)' },
        { id: 'notebook', title: 'Notebook', subtitle: 'Academic Synthesis', description: 'Markdown drafting with automated scripture linking.', color: 'var(--accent-green)' },
    ] as const;

    const handleAction = (id: string) => {
        if (id === 'notebook') {
            setHomeNotebookOpen(true);
        } else if (id === 'library' || id === 'timeline') {
            setViewMode('reader');
            openSource(id as any);
        } else {
            openSource(id as any);
        }
    };

    return (
        <div className="immersive-home">
            <div className="home-hero-v2 animate-fade">
                <img src="/assets/triscriptum_logo.svg" alt="TriScriptum Logo" style={{ height: '64px', marginBottom: '1.5rem' }} />
                <br />
                <span className="top-badge">High-Precision Scripture Analysis</span>
                <h1 className="hero-title-v2">TriScriptum</h1>
                <p className="hero-desc-v2">Search and learn from ancient texts with high-precision research tools.</p>
            </div>

            <div className="book-selection-grid library-grid">
                {modules.map(mod => (
                    <div
                        key={mod.id}
                        className={`book-card glass ${mod.id}-card card-with-bg`}
                        style={{ '--accent': mod.color } as React.CSSProperties}
                        onClick={() => handleAction(mod.id)}
                    >
                        <div className="card-bg-overlay"></div>
                        <div className="card-accent-bar"></div>
                        <div className="card-content">
                            <span className="subtitle">{mod.subtitle}</span>
                            <h2>{mod.title}</h2>
                            <p>{mod.description}</p>
                            <div className="card-footer">
                                <span>Initialize Workspace →</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="home-meta-footer">
                <span className="status-dot"></span> TriScriptum Engine Active | v2.1.0 Premium
            </div>
        </div>
    );
};

export default Home;
