require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Book = require('./models/Book');
const Verse = require('./models/Verse');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bible_app';

async function seedDatabase() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    // ==============================================================
    // PHASE 1: The Book Baseline Setup
    // ==============================================================
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('📚 Book collection is empty. Seeding 66 Canonical Books metadata...');
      
      const booksData = [
        { bookNumber: 1, name: 'Genesis', abbreviation: 'Gen', testament: 'OT', totalChapters: 50 },
        { bookNumber: 2, name: 'Exodus', abbreviation: 'Exo', testament: 'OT', totalChapters: 40 },
        { bookNumber: 3, name: 'Leviticus', abbreviation: 'Lev', testament: 'OT', totalChapters: 27 },
        { bookNumber: 4, name: 'Numbers', abbreviation: 'Num', testament: 'OT', totalChapters: 36 },
        { bookNumber: 5, name: 'Deuteronomy', abbreviation: 'Deu', testament: 'OT', totalChapters: 34 },
        { bookNumber: 6, name: 'Joshua', abbreviation: 'Jos', testament: 'OT', totalChapters: 24 },
        { bookNumber: 7, name: 'Judges', abbreviation: 'Jdg', testament: 'OT', totalChapters: 21 },
        { bookNumber: 8, name: 'Ruth', abbreviation: 'Rut', testament: 'OT', totalChapters: 4 },
        { bookNumber: 9, name: '1 Samuel', abbreviation: '1Sa', testament: 'OT', totalChapters: 31 },
        { bookNumber: 10, name: '2 Samuel', abbreviation: '2Sa', testament: 'OT', totalChapters: 24 },
        { bookNumber: 11, name: '1 Kings', abbreviation: '1Ki', testament: 'OT', totalChapters: 22 },
        { bookNumber: 12, name: '2 Kings', abbreviation: '2Ki', testament: 'OT', totalChapters: 25 },
        { bookNumber: 13, name: '1 Chronicles', abbreviation: '1Ch', testament: 'OT', totalChapters: 29 },
        { bookNumber: 14, name: '2 Chronicles', abbreviation: '2Ch', testament: 'OT', totalChapters: 36 },
        { bookNumber: 15, name: 'Ezra', abbreviation: 'Ezr', testament: 'OT', totalChapters: 10 },
        { bookNumber: 16, name: 'Nehemiah', abbreviation: 'Neh', testament: 'OT', totalChapters: 13 },
        { bookNumber: 17, name: 'Esther', abbreviation: 'Est', testament: 'OT', totalChapters: 10 },
        { bookNumber: 18, name: 'Job', abbreviation: 'Job', testament: 'OT', totalChapters: 42 },
        { bookNumber: 19, name: 'Psalms', abbreviation: 'Psa', testament: 'OT', totalChapters: 150 },
        { bookNumber: 20, name: 'Proverbs', abbreviation: 'Pro', testament: 'OT', totalChapters: 31 },
        { bookNumber: 21, name: 'Ecclesiastes', abbreviation: 'Ecc', testament: 'OT', totalChapters: 12 },
        { bookNumber: 22, name: 'Song of Solomon', abbreviation: 'Sng', testament: 'OT', totalChapters: 8 },
        { bookNumber: 23, name: 'Isaiah', abbreviation: 'Isa', testament: 'OT', totalChapters: 66 },
        { bookNumber: 24, name: 'Jeremiah', abbreviation: 'Jer', testament: 'OT', totalChapters: 52 },
        { bookNumber: 25, name: 'Lamentations', abbreviation: 'Lam', testament: 'OT', totalChapters: 5 },
        { bookNumber: 26, name: 'Ezekiel', abbreviation: 'Eze', testament: 'OT', totalChapters: 48 },
        { bookNumber: 27, name: 'Daniel', abbreviation: 'Dan', testament: 'OT', totalChapters: 12 },
        { bookNumber: 28, name: 'Hosea', abbreviation: 'Hos', testament: 'OT', totalChapters: 14 },
        { bookNumber: 29, name: 'Joel', abbreviation: 'Joe', testament: 'OT', totalChapters: 3 },
        { bookNumber: 30, name: 'Amos', abbreviation: 'Amo', testament: 'OT', totalChapters: 9 },
        { bookNumber: 31, name: 'Obadiah', abbreviation: 'Oba', testament: 'OT', totalChapters: 1 },
        { bookNumber: 32, name: 'Jonah', abbreviation: 'Jon', testament: 'OT', totalChapters: 4 },
        { bookNumber: 33, name: 'Micah', abbreviation: 'Mic', testament: 'OT', totalChapters: 7 },
        { bookNumber: 34, name: 'Nahum', abbreviation: 'Nah', testament: 'OT', totalChapters: 3 },
        { bookNumber: 35, name: 'Habakkuk', abbreviation: 'Hab', testament: 'OT', totalChapters: 3 },
        { bookNumber: 36, name: 'Zephaniah', abbreviation: 'Zep', testament: 'OT', totalChapters: 3 },
        { bookNumber: 37, name: 'Haggai', abbreviation: 'Hag', testament: 'OT', totalChapters: 2 },
        { bookNumber: 38, name: 'Zechariah', abbreviation: 'Zec', testament: 'OT', totalChapters: 14 },
        { bookNumber: 39, name: 'Malachi', abbreviation: 'Mal', testament: 'OT', totalChapters: 4 },
        { bookNumber: 40, name: 'Matthew', abbreviation: 'Mat', testament: 'NT', totalChapters: 28 },
        { bookNumber: 41, name: 'Mark', abbreviation: 'Mak', testament: 'NT', totalChapters: 16 },
        { bookNumber: 42, name: 'Luke', abbreviation: 'Luk', testament: 'NT', totalChapters: 24 },
        { bookNumber: 43, name: 'John', abbreviation: 'Jhn', testament: 'NT', totalChapters: 21 },
        { bookNumber: 44, name: 'Acts', abbreviation: 'Act', testament: 'NT', totalChapters: 28 },
        { bookNumber: 45, name: 'Romans', abbreviation: 'Rom', testament: 'NT', totalChapters: 16 },
        { bookNumber: 46, name: '1 Corinthians', abbreviation: '1Co', testament: 'NT', totalChapters: 16 },
        { bookNumber: 47, name: '2 Corinthians', abbreviation: '2Co', testament: 'NT', totalChapters: 13 },
        { bookNumber: 48, name: 'Galatians', abbreviation: 'Gal', testament: 'NT', totalChapters: 6 },
        { bookNumber: 49, name: 'Ephesians', abbreviation: 'Eph', testament: 'NT', totalChapters: 6 },
        { bookNumber: 50, name: 'Philippians', abbreviation: 'Php', testament: 'NT', totalChapters: 4 },
        { bookNumber: 51, name: 'Colossians', abbreviation: 'Col', testament: 'NT', totalChapters: 4 },
        { bookNumber: 52, name: '1 Thessalonians', abbreviation: '1Th', testament: 'NT', totalChapters: 5 },
        { bookNumber: 53, name: '2 Thessalonians', abbreviation: '2Th', testament: 'NT', totalChapters: 3 },
        { bookNumber: 54, name: '1 Timothy', abbreviation: '1Ti', testament: 'NT', totalChapters: 6 },
        { bookNumber: 55, name: '2 Timothy', abbreviation: '2Ti', testament: 'NT', totalChapters: 4 },
        { bookNumber: 56, name: 'Titus', abbreviation: 'Tit', testament: 'NT', totalChapters: 3 },
        { bookNumber: 57, name: 'Philemon', abbreviation: 'Phm', testament: 'NT', totalChapters: 1 },
        { bookNumber: 58, name: 'Hebrews', abbreviation: 'Heb', testament: 'NT', totalChapters: 13 },
        { bookNumber: 59, name: 'James', abbreviation: 'Jas', testament: 'NT', totalChapters: 5 },
        { bookNumber: 60, name: '1 Peter', abbreviation: '1Pe', testament: 'NT', totalChapters: 5 },
        { bookNumber: 61, name: '2 Peter', abbreviation: '2Pe', testament: 'NT', totalChapters: 3 },
        { bookNumber: 62, name: '1 John', abbreviation: '1Jn', testament: 'NT', totalChapters: 5 },
        { bookNumber: 63, name: '2 John', abbreviation: '2Jn', testament: 'NT', totalChapters: 1 },
        { bookNumber: 64, name: '3 John', abbreviation: '3Jn', testament: 'NT', totalChapters: 1 },
        { bookNumber: 65, name: 'Jude', abbreviation: 'Jud', testament: 'NT', totalChapters: 1 },
        { bookNumber: 66, name: 'Revelation', abbreviation: 'Rev', testament: 'NT', totalChapters: 22 }
      ];

      await Book.insertMany(booksData);
      console.log(`✅ Seeded ${booksData.length} Canonical Books.`);
    } else {
      console.log(`ℹ️ Book collection already seeded with ${bookCount} books. Skipping Phase 1.`);
    }

    // ==============================================================
    // PHASE 2: The Intelligent Translation Upsert Pipeline (Telugu)
    // ==============================================================
    console.log('📖 Starting Verse / Translation Seeding Phase (Telugu Edition)...');

    const translationToLoad = 'TELUGU'; 
    const dbFilePath = path.join(__dirname, '../../telugu_bsi.db');

    if (!fs.existsSync(dbFilePath)) {
       console.error(`❌ File not found at ${dbFilePath}`);
       process.exit(1);
    }

    console.log(`⏳ Loading data from SQLite database natively from ${dbFilePath} into memory...`);
    
    // Using better-sqlite3 to extract data since CSVs are deleted
    const Database = require('better-sqlite3');
    const db = new Database(dbFilePath, { readonly: true });
    
    const rows = db.prepare('SELECT * FROM verses').all();
    const versesData = rows.map(row => ({
      b: parseInt(row.b || row.Book, 10),
      c: parseInt(row.c || row.Chapter, 10),
      v: parseInt(row.v || row.Verse, 10),
      t: row.t || row.Text
    }));
    db.close();

    console.log(`✅ Native SQLite extraction complete. Found ${versesData.length} rows. Executing batch upserts...`);

    const BATCH_SIZE = 1000;
    let bulkOps = [];
    let processedCount = 0;

    for (const row of versesData) {
      const bookNumber = row.b;
      const chapterNumber = row.c;
      const verseNumber = row.v;
      const text = row.t;

      if (isNaN(bookNumber) || isNaN(chapterNumber) || isNaN(verseNumber) || !text) {
         continue; 
      }

      bulkOps.push({
        updateOne: {
          filter: { bookNumber, chapterNumber, verseNumber },
          update: { 
            $set: { [`translations.${translationToLoad}`]: text } 
          },
          upsert: true 
        }
      });

      if (bulkOps.length === BATCH_SIZE) {
        await Verse.bulkWrite(bulkOps, { ordered: false });
        processedCount += bulkOps.length;
        console.log(`   ...processed ${processedCount} verses`);
        bulkOps = []; 
      }
    }

    if (bulkOps.length > 0) {
      await Verse.bulkWrite(bulkOps, { ordered: false });
      processedCount += bulkOps.length;
      console.log(`   ...processed ${processedCount} verses`);
    }

    console.log(`✅ Phase 2 Complete. ${processedCount} verses natively parsed and upserted into the MongoDB map for translation: [${translationToLoad}].`);

  } catch (error) {
    console.error('❌ Error during seeding process:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
