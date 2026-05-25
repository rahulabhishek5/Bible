const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Book = require('../models/Book');
const Verse = require('../models/Verse');

// ============================================================
// COMPLETE 66-BOOK NAVIGATION MANIFEST
// ============================================================
const MOCK_BOOKS = [
  { bookNumber: 1,  name: 'Genesis',          abbreviation: 'Gen', testament: 'Old', totalChapters: 50  },
  { bookNumber: 2,  name: 'Exodus',           abbreviation: 'Exo', testament: 'Old', totalChapters: 40  },
  { bookNumber: 3,  name: 'Leviticus',        abbreviation: 'Lev', testament: 'Old', totalChapters: 27  },
  { bookNumber: 4,  name: 'Numbers',          abbreviation: 'Num', testament: 'Old', totalChapters: 36  },
  { bookNumber: 5,  name: 'Deuteronomy',      abbreviation: 'Deu', testament: 'Old', totalChapters: 34  },
  { bookNumber: 6,  name: 'Joshua',           abbreviation: 'Jos', testament: 'Old', totalChapters: 24  },
  { bookNumber: 7,  name: 'Judges',           abbreviation: 'Jdg', testament: 'Old', totalChapters: 21  },
  { bookNumber: 8,  name: 'Ruth',             abbreviation: 'Rut', testament: 'Old', totalChapters: 4   },
  { bookNumber: 9,  name: '1 Samuel',         abbreviation: '1Sa', testament: 'Old', totalChapters: 31  },
  { bookNumber: 10, name: '2 Samuel',         abbreviation: '2Sa', testament: 'Old', totalChapters: 24  },
  { bookNumber: 11, name: '1 Kings',          abbreviation: '1Ki', testament: 'Old', totalChapters: 22  },
  { bookNumber: 12, name: '2 Kings',          abbreviation: '2Ki', testament: 'Old', totalChapters: 25  },
  { bookNumber: 13, name: '1 Chronicles',     abbreviation: '1Ch', testament: 'Old', totalChapters: 29  },
  { bookNumber: 14, name: '2 Chronicles',     abbreviation: '2Ch', testament: 'Old', totalChapters: 36  },
  { bookNumber: 15, name: 'Ezra',             abbreviation: 'Ezr', testament: 'Old', totalChapters: 10  },
  { bookNumber: 16, name: 'Nehemiah',         abbreviation: 'Neh', testament: 'Old', totalChapters: 13  },
  { bookNumber: 17, name: 'Esther',           abbreviation: 'Est', testament: 'Old', totalChapters: 10  },
  { bookNumber: 18, name: 'Job',              abbreviation: 'Job', testament: 'Old', totalChapters: 42  },
  { bookNumber: 19, name: 'Psalms',           abbreviation: 'Psa', testament: 'Old', totalChapters: 150 },
  { bookNumber: 20, name: 'Proverbs',         abbreviation: 'Pro', testament: 'Old', totalChapters: 31  },
  { bookNumber: 21, name: 'Ecclesiastes',     abbreviation: 'Ecc', testament: 'Old', totalChapters: 12  },
  { bookNumber: 22, name: 'Song of Solomon',  abbreviation: 'Son', testament: 'Old', totalChapters: 8   },
  { bookNumber: 23, name: 'Isaiah',           abbreviation: 'Isa', testament: 'Old', totalChapters: 66  },
  { bookNumber: 24, name: 'Jeremiah',         abbreviation: 'Jer', testament: 'Old', totalChapters: 52  },
  { bookNumber: 25, name: 'Lamentations',     abbreviation: 'Lam', testament: 'Old', totalChapters: 5   },
  { bookNumber: 26, name: 'Ezekiel',          abbreviation: 'Eze', testament: 'Old', totalChapters: 48  },
  { bookNumber: 27, name: 'Daniel',           abbreviation: 'Dan', testament: 'Old', totalChapters: 12  },
  { bookNumber: 28, name: 'Hosea',            abbreviation: 'Hos', testament: 'Old', totalChapters: 14  },
  { bookNumber: 29, name: 'Joel',             abbreviation: 'Joe', testament: 'Old', totalChapters: 3   },
  { bookNumber: 30, name: 'Amos',             abbreviation: 'Amo', testament: 'Old', totalChapters: 9   },
  { bookNumber: 31, name: 'Obadiah',          abbreviation: 'Oba', testament: 'Old', totalChapters: 1   },
  { bookNumber: 32, name: 'Jonah',            abbreviation: 'Jon', testament: 'Old', totalChapters: 4   },
  { bookNumber: 33, name: 'Micah',            abbreviation: 'Mic', testament: 'Old', totalChapters: 7   },
  { bookNumber: 34, name: 'Nahum',            abbreviation: 'Nah', testament: 'Old', totalChapters: 3   },
  { bookNumber: 35, name: 'Habakkuk',         abbreviation: 'Hab', testament: 'Old', totalChapters: 3   },
  { bookNumber: 36, name: 'Zephaniah',        abbreviation: 'Zep', testament: 'Old', totalChapters: 3   },
  { bookNumber: 37, name: 'Haggai',           abbreviation: 'Hag', testament: 'Old', totalChapters: 2   },
  { bookNumber: 38, name: 'Zechariah',        abbreviation: 'Zec', testament: 'Old', totalChapters: 14  },
  { bookNumber: 39, name: 'Malachi',          abbreviation: 'Mal', testament: 'Old', totalChapters: 4   },
  { bookNumber: 40, name: 'Matthew',          abbreviation: 'Mat', testament: 'New', totalChapters: 28  },
  { bookNumber: 41, name: 'Mark',             abbreviation: 'Mar', testament: 'New', totalChapters: 16  },
  { bookNumber: 42, name: 'Luke',             abbreviation: 'Luk', testament: 'New', totalChapters: 24  },
  { bookNumber: 43, name: 'John',             abbreviation: 'Joh', testament: 'New', totalChapters: 21  },
  { bookNumber: 44, name: 'Acts',             abbreviation: 'Act', testament: 'New', totalChapters: 28  },
  { bookNumber: 45, name: 'Romans',           abbreviation: 'Rom', testament: 'New', totalChapters: 16  },
  { bookNumber: 46, name: '1 Corinthians',    abbreviation: '1Co', testament: 'New', totalChapters: 16  },
  { bookNumber: 47, name: '2 Corinthians',    abbreviation: '2Co', testament: 'New', totalChapters: 13  },
  { bookNumber: 48, name: 'Galatians',        abbreviation: 'Gal', testament: 'New', totalChapters: 6   },
  { bookNumber: 49, name: 'Ephesians',        abbreviation: 'Eph', testament: 'New', totalChapters: 6   },
  { bookNumber: 50, name: 'Philippians',      abbreviation: 'Phi', testament: 'New', totalChapters: 4   },
  { bookNumber: 51, name: 'Colossians',       abbreviation: 'Col', testament: 'New', totalChapters: 4   },
  { bookNumber: 52, name: '1 Thessalonians',  abbreviation: '1Th', testament: 'New', totalChapters: 5   },
  { bookNumber: 53, name: '2 Thessalonians',  abbreviation: '2Th', testament: 'New', totalChapters: 3   },
  { bookNumber: 54, name: '1 Timothy',        abbreviation: '1Ti', testament: 'New', totalChapters: 6   },
  { bookNumber: 55, name: '2 Timothy',        abbreviation: '2Ti', testament: 'New', totalChapters: 4   },
  { bookNumber: 56, name: 'Titus',            abbreviation: 'Tit', testament: 'New', totalChapters: 3   },
  { bookNumber: 57, name: 'Philemon',         abbreviation: 'Phm', testament: 'New', totalChapters: 1   },
  { bookNumber: 58, name: 'Hebrews',          abbreviation: 'Heb', testament: 'New', totalChapters: 13  },
  { bookNumber: 59, name: 'James',            abbreviation: 'Jam', testament: 'New', totalChapters: 5   },
  { bookNumber: 60, name: '1 Peter',          abbreviation: '1Pe', testament: 'New', totalChapters: 5   },
  { bookNumber: 61, name: '2 Peter',          abbreviation: '2Pe', testament: 'New', totalChapters: 3   },
  { bookNumber: 62, name: '1 John',           abbreviation: '1Jo', testament: 'New', totalChapters: 5   },
  { bookNumber: 63, name: '2 John',           abbreviation: '2Jo', testament: 'New', totalChapters: 1   },
  { bookNumber: 64, name: '3 John',           abbreviation: '3Jo', testament: 'New', totalChapters: 1   },
  { bookNumber: 65, name: 'Jude',             abbreviation: 'Jud', testament: 'New', totalChapters: 1   },
  { bookNumber: 66, name: 'Revelation',       abbreviation: 'Rev', testament: 'New', totalChapters: 22  },
];

// ============================================================
// CSV VERSE STORE
// Populated at server startup by parseCsvIntoMemory().
// Key format: "bookNum_chapNum" → sorted array of verse objects.
// ============================================================
const verseStore = {};    // { "1_1": [{...}, ...], "1_2": [...], ... }
const allVerses  = [];    // Flat array used for full-text search
let   csvReady   = false; // Guard flag — routes wait until CSV is parsed

// ============================================================
// PARSER: Stream-reads verse.csv at startup using only readline.
// CSV columns: id, t (Telugu text), b (book), c (chapter), v (verse)
// ============================================================
const CSV_TELUGU = path.join(__dirname, '../../verse.csv');
const CSV_KJV = path.join(__dirname, '../../kjv_en.csv');

function loadCsvFile(filePath, languageKey) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  [CSV Loader]: ${filePath} not found. ${languageKey} text will be unavailable.`);
      return resolve();
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    });

    let isFirstLine = true;
    let count = 0;

    rl.on('line', (rawLine) => {
      // Skip header row
      if (isFirstLine) { isFirstLine = false; return; }

      const line = rawLine.trim();
      if (!line) return;

      // Handle quoted fields: split on commas but respect CSV quoting
      const firstComma = line.indexOf(',');
      const lastComma  = line.lastIndexOf(',');
      const secondLastComma = line.lastIndexOf(',', lastComma - 1);
      const thirdLastComma  = line.lastIndexOf(',', secondLastComma - 1);

      const id      = line.substring(0, firstComma).trim();
      const rawText = line.substring(firstComma + 1, thirdLastComma).trim();
      const b       = parseInt(line.substring(thirdLastComma + 1, secondLastComma).trim(), 10);
      const c       = parseInt(line.substring(secondLastComma + 1, lastComma).trim(), 10);
      const v       = parseInt(line.substring(lastComma + 1).trim(), 10);

      if (isNaN(b) || isNaN(c) || isNaN(v)) return;

      // Strip surrounding quotes if present
      const text = rawText.startsWith('"') && rawText.endsWith('"')
        ? rawText.slice(1, -1).replace(/""/g, '"')
        : rawText;

      const key = `${b}_${c}`;
      if (!verseStore[key]) verseStore[key] = [];

      // Find existing verse or create new one
      let verse = verseStore[key].find(vObj => vObj.verseNumber === v);
      if (!verse) {
        verse = {
          _id:           `csv_${b}_${c}_${v}`, // unique semantic id
          bookNumber:    b,
          chapterNumber: c,
          verseNumber:   v,
          translations:  {}
        };
        verseStore[key].push(verse);
        allVerses.push(verse);
      }

      // Merge translation text
      verse.translations[languageKey] = text;
      count++;
    });

    rl.on('close', () => {
      console.log(`✅ [CSV Loader]: Indexed ${count.toLocaleString()} ${languageKey} verses.`);
      resolve();
    });

    rl.on('error', (err) => {
      console.error(`❌ [CSV Loader]: Failed to read ${filePath}:`, err.message);
      resolve();
    });
  });
}

async function parseAllCsvIntoMemory() {
  await loadCsvFile(CSV_TELUGU, 'TELUGU');
  await loadCsvFile(CSV_KJV, 'KJV');
  
  // Sort each chapter's verses by verseNumber after all files are merged
  for (const key of Object.keys(verseStore)) {
    verseStore[key].sort((a, b) => a.verseNumber - b.verseNumber);
  }
  
  csvReady = true;
  console.log(`✅ [CSV Loader]: Complete. Ready for queries.`);
}

// Trigger CSV parse immediately when this module is first loaded
parseAllCsvIntoMemory();

// ============================================================
// HELPERS
// ============================================================
const isMockMode = () => process.env.DB_MODE === 'MOCK';

// Navigation cache (LIVE mode only)
let navigationCache = null;

// ============================================================
// ROUTE 1: GET /api/bible/navigation-menu
// ============================================================
router.get('/navigation-menu', async (req, res) => {
  try {
    if (isMockMode()) {
      return res.status(200).json({
        status: 'success',
        mode:   'MOCK',
        totalBooks: MOCK_BOOKS.length,
        data:   MOCK_BOOKS,
      });
    }

    if (navigationCache) return res.status(200).json(navigationCache);

    const books = await Book.find({}, { _id: 0, __v: 0 }).sort({ bookNumber: 1 }).lean();
    navigationCache = { status: 'success', mode: 'LIVE', totalBooks: books.length, data: books };
    return res.status(200).json(navigationCache);
  } catch (error) {
    console.error('Navigation Menu Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load navigation data' });
  }
});

// ============================================================
// ROUTE 2: GET /api/bible/search?q=query&translation=TELUGU
// ============================================================
router.get('/search', async (req, res) => {
  const { q, translation } = req.query;

  if (!q) {
    return res.status(400).json({ status: 'error', message: 'Query parameter "q" is required' });
  }

  try {
    if (isMockMode()) {
      const queryLower = q.toLowerCase();

      const filtered = allVerses.filter((verse) => {
        const teluguText = (verse.translations.TELUGU || '').toLowerCase();
        const kjvText    = (verse.translations.KJV    || '').toLowerCase();

        if (translation === 'TELUGU') return teluguText.includes(queryLower);
        if (translation === 'KJV')    return kjvText.includes(queryLower);
        return teluguText.includes(queryLower) || kjvText.includes(queryLower);
      });

      return res.status(200).json({
        status:  'success',
        mode:    'MOCK',
        results: filtered.length,
        data:    filtered.slice(0, 50),
      });
    }

    let query = {};
    if (translation) {
      query[`translations.${translation}`] = { $regex: q, $options: 'i' };
    } else {
      query = { $text: { $search: q } };
    }

    const verses = await Verse.find(query).limit(50).lean();
    return res.status(200).json({ status: 'success', mode: 'LIVE', results: verses.length, data: verses });
  } catch (error) {
    console.error('Search Route Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to perform search query' });
  }
});

// ============================================================
// ROUTE 3: GET /api/bible/chapter/:bookNumber/:chapterNumber
// ============================================================
router.get('/chapter/:bookNumber/:chapterNumber', async (req, res) => {
  const bookNum = Number(req.params.bookNumber);
  const chapNum = Number(req.params.chapterNumber);

  try {
    if (isMockMode()) {
      const key    = `${bookNum}_${chapNum}`;
      const verses = verseStore[key] || [];

      return res.status(200).json({
        status:  'success',
        mode:    'MOCK',
        results: verses.length,
        data:    verses,
      });
    }

    const verses = await Verse.find({ bookNumber: bookNum, chapterNumber: chapNum })
      .sort({ verseNumber: 1 })
      .lean();

    return res.status(200).json({ status: 'success', mode: 'LIVE', results: verses.length, data: verses });
  } catch (error) {
    console.error('Chapter Fetch Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve chapter data' });
  }
});

module.exports = router;
