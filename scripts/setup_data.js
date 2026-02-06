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
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    return await response.json();
}

const BIBLE_METADATA_MAP = {
    'Genesis': { lang: 'Hebrew', dating: '15th-5th Century BCE', themes: ['Creation', 'Covenant', 'Beginnings'] },
    'Exodus': { lang: 'Hebrew', dating: '15th-13th Century BCE', themes: ['Liberation', 'Law', 'Covenant'] },
    'Leviticus': { lang: 'Hebrew', dating: '15th-13th Century BCE', themes: ['Holiness', 'Sacrifice', 'Law'] },
    'Numbers': { lang: 'Hebrew', dating: '15th-13th Century BCE', themes: ['Wandering', 'Census', 'Faithfulness'] },
    'Deuteronomy': { lang: 'Hebrew', dating: '15th-13th Century BCE', themes: ['Law', 'Remembrance', 'Covenant'] },
    // Simplified for others
    'Matthew': { lang: 'Greek', dating: '1st Century CE', themes: ['Kingdom', 'Messiah', 'Prophecy'] },
    'Mark': { lang: 'Greek', dating: '1st Century CE', themes: ['Servant', 'Action', 'Gospel'] },
    'Luke': { lang: 'Greek', dating: '1st Century CE', themes: ['Humanity', 'Compassion', 'Gospel'] },
    'John': { lang: 'Greek', dating: '1st Century CE', themes: ['Divinity', 'Truth', 'Life'] },
};

function getBibleMeta(bookName) {
    if (BIBLE_METADATA_MAP[bookName]) return BIBLE_METADATA_MAP[bookName];
    // Default fallback
    const isOT = true; // Simplified check
    return {
        lang: isOT ? 'Hebrew' : 'Greek',
        dating: isOT ? 'Ancient' : '1st Century CE',
        themes: []
    };
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

async function main() {
    try {
        console.log("Starting Structured Data Setup...");

        const biblePath = path.join(DATA_DIR, 'bible_from_curl.json');
        if (!fs.existsSync(biblePath)) {
            console.error("Error: bible_from_curl.json missing.");
            process.exit(1);
        }

        const bibleRaw = fs.readFileSync(biblePath, 'utf8').replace(/^\uFEFF/, '');
        const bibleData = JSON.parse(bibleRaw);

        const buildStructuredSource = (data, sourcePrefix) => {
            return data.map((book, bIdx) => {
                const bookSlug = slugify(book.name);
                return {
                    name: book.name,
                    slug: bookSlug,
                    chapters: book.chapters.map((chapterVerses, cIdx) => ({
                        number: cIdx + 1,
                        verses: chapterVerses.map((verseText, vIdx) => ({
                            id: `${sourcePrefix.toUpperCase()}_${bookSlug.toUpperCase()}_${cIdx + 1}_${vIdx + 1}`,
                            number: vIdx + 1,
                            translations: {
                                'WEB': verseText.replace(/<[^>]*>?/gm, '')
                            },
                            meta: getBibleMeta(book.name)
                        }))
                    }))
                };
            });
        };

        const processedBible = buildStructuredSource(bibleData, 'BIBLE');
        const TORAH_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
        const torahBooks = processedBible.filter(b => TORAH_BOOKS.includes(b.name)).map(b => ({
            ...b,
            chapters: b.chapters.map(c => ({
                ...c,
                verses: c.verses.map(v => ({
                    ...v,
                    id: v.id.replace('BIBLE_', 'TORAH_')
                }))
            }))
        }));

        fs.writeFileSync(path.join(DATA_DIR, 'bible.json'), JSON.stringify(processedBible, null, 2));
        fs.writeFileSync(path.join(DATA_DIR, 'torah.json'), JSON.stringify(torahBooks, null, 2));
        console.log('Saved bible.json and torah.json');

        // Quran Fetching
        console.log("Fetching Quran (Sahih + Pickthall)...");
        const quranBooks = [];
        const surahNames = await fetchJson('https://api.quran.com/api/v4/chapters');

        for (let i = 1; i <= 114; i++) {
            const name = surahNames.chapters[i - 1].name_simple;
            const slug = slugify(name);
            process.stdout.write(`Surah ${i} (${name})... `);

            const [sahihRes, pickthallRes] = await Promise.all([
                fetchJson(`https://api.quran.com/api/v4/quran/translations/20?chapter_number=${i}`),
                fetchJson(`https://api.quran.com/api/v4/quran/translations/19?chapter_number=${i}`)
            ]);

            const verses = sahihRes.translations.map((v, idx) => ({
                id: `QURAN_SURAH_${i}_${idx + 1}`,
                number: idx + 1,
                translations: {
                    'SAHIH': v.text.replace(/<[^>]*>?/gm, ''),
                    'PICKTHALL': pickthallRes.translations[idx].text.replace(/<[^>]*>?/gm, '')
                },
                meta: {
                    lang: 'Arabic',
                    dating: '7th Century CE',
                    themes: [] // Placeholder for theme enrichment
                }
            }));

            quranBooks.push({
                name: `Surah ${i}: ${name}`,
                slug: `surah_${i}`,
                chapters: [{
                    number: 1,
                    verses: verses
                }]
            });
            console.log("Done.");
            await new Promise(r => setTimeout(r, 100));
        }

        fs.writeFileSync(path.join(DATA_DIR, 'quran.json'), JSON.stringify(quranBooks, null, 2));
        console.log('Saved quran.json');

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

main();
