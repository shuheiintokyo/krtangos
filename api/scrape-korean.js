const KoreanScraper = require('../lib/scraper');
const Translator = require('../lib/translator');
const VocabularyExtractor = require('../lib/vocabularyExtractor');
const AppwriteClient = require('../lib/appwriteClient');

module.exports = async (req, res) => {
    // Set timeout headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log('🚀 Starting Korean vocabulary collection...');
    const startTime = Date.now();

    try {
        const scraper = new KoreanScraper();
        const translator = new Translator();
        const extractor = new VocabularyExtractor();
        const appwrite = new AppwriteClient();

        console.log('📰 Step 1: Scraping Korean news...');
        const rawWords = await scraper.scrapeVocabulary(5);

        if (rawWords.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No Korean words found',
                added: 0,
                duration: `${Date.now() - startTime}ms`
            });
        }

        console.log('📚 Step 2: Selecting best vocabulary...');
        const selectedWords = extractor.selectBestWords(rawWords, 15);

        console.log('🌐 Step 3: Translating to Japanese...');
        const translations = await translator.batchTranslate(selectedWords);

        console.log('💾 Step 4: Saving to database...');
        const results = [];
        const source = scraper.getSourceName();

        for (let i = 0; i < selectedWords.length; i++) {
            const korean = selectedWords[i];
            const japanese = translations[i];

            const result = await appwrite.addVocabulary(korean, japanese, source);
            results.push(result);
        }

        const added = results.filter(r => r.status === 'added').length;
        const duplicates = results.filter(r => r.status === 'duplicate').length;
        const errors = results.filter(r => r.status === 'error').length;
        const duration = `${Date.now() - startTime}ms`;

        console.log(`✅ Complete! Added: ${added}, Duplicates: ${duplicates}, Errors: ${errors}, Duration: ${duration}`);

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            source: source,
            wordsProcessed: selectedWords.length,
            added,
            duplicates,
            errors,
            duration,
            results: results.slice(0, 5)  // Only return first 5 for brevity
        });

    } catch (error) {
        console.error('💥 Fatal error:', error);
        
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`
        });
    }
};