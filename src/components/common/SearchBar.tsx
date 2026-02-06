import React, { useState } from 'react';
import { useScripture } from '../../context/ScriptureContext.tsx';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const { searchQuery, searchFilter, setSearchFilter } = useScripture();
    const [localQuery, setLocalQuery] = useState(searchQuery);

    React.useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localQuery);
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <div className="search-filter-wrapper">
                <select
                    className="search-filter-select"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value as any)}
                >
                    <option value="all">All Books</option>
                    <option value="torah">Torah</option>
                    <option value="bible">Bible</option>
                    <option value="quran">Quran</option>
                </select>
            </div>
            <div className="search-divider"></div>
            <input
                type="text"
                placeholder="Search..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                autoComplete="off"
            />
            <button type="submit" className="search-btn">Go</button>
        </form>
    );
};

export default SearchBar;
