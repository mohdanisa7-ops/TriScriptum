import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchJson(url) {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    return await response.json();
}

async function main() {
    try {
        console.log("Processing local data files...");

        // 1. Load Bible (KJV)
        // Source: public/data/bible_from_curl.json
        const biblePath = path.join(DATA_DIR, 'bible_from_curl.json');
        if (!fs.existsSync(biblePath)) throw new Error("Bible source file missing");

        const bibleData = JSON.parse(fs.readFileSync(biblePath, 'utf8'));

        // 2. Process Bible & Torah
        const TORAH_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];

        const processedBible = bibleData.map(book => ({
            name: book.name,
            chapters: book.chapters // Array of arrays of strings
        }));

        const torahBooks = processedBible.filter(b => TORAH_BOOKS.includes(b.name));

        // Save Bible
        fs.writeFileSync(path.join(DATA_DIR, 'bible.json'), JSON.stringify(processedBible, null, 2));
        console.log('Saved bible.json');

        // Save Torah
        fs.writeFileSync(path.join(DATA_DIR, 'torah.json'), JSON.stringify(torahBooks, null, 2));
        console.log('Saved torah.json');

        // 3. Load Quran (Sahih International)
        // Source: public/data/quran_from_curl.json
        const quranPath = path.join(DATA_DIR, 'quran_from_curl.json');
        if (!fs.existsSync(quranPath)) throw new Error("Quran source file missing");

        const quranRaw = JSON.parse(fs.readFileSync(quranPath, 'utf8'));

        // Group by chapter
        const chaptersMap = new Map();
        quranRaw.quran.forEach(item => {
            if (!chaptersMap.has(item.chapter)) {
                chaptersMap.set(item.chapter, []);
            }
            chaptersMap.get(item.chapter).push(item.text);
        });

        const processedQuran = [];
        for (let i = 1; i <= 114; i++) {
            const verses = chaptersMap.get(i) || [];
            processedQuran.push({
                name: `Surah ${i}`,
                chapters: [verses] // Single chapter per Surah
            });
        }

        fs.writeFileSync(path.join(DATA_DIR, 'quran.json'), JSON.stringify(processedQuran, null, 2));
        console.log('Saved quran.json');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
