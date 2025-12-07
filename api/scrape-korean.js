const KoreanScraper = require('../lib/scraper');
const Translator = require('../lib/translator');
const SentenceExtractor = require('../lib/sentenceExtractor');
const AppwriteClient = require('../lib/appwriteClient');

module.exports = async (req, res) => {
    // Set timeout headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log('🚀 Starting Korean sentence collection...');
    const startTime = Date.now();

    try {
        const scraper = new KoreanScraper();
        const translator = new Translator();
        const extractor = new SentenceExtractor();
        const appwrite = new AppwriteClient();

        console.log('📰 Step 1: Scraping Korean news sentences...');
        const rawSentences = await scraper.scrapeSentences(5); // Scrape 5 articles

        if (rawSentences.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No Korean sentences found',
                added: 0,
                duration: `${Date.now() - startTime}ms`
            });
        }

        console.log('📚 Step 2: Selecting best sentences...');
        const selectedSentences = extractor.selectBestSentences(rawSentences, 10); // Select top 10

        console.log('🌐 Step 3: Translating to Japanese...');
        const translations = await translator.batchTranslate(selectedSentences);

        console.log('💾 Step 4: Saving to database...');
        const results = [];
        const source = scraper.getSourceName();

        for (let i = 0; i < selectedSentences.length; i++) {
            const korean = selectedSentences[i];
            const japanese = translations[i];

            const result = await appwrite.addSentence(korean, japanese, source);
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
            sentencesProcessed: selectedSentences.length,
            added,
            duplicates,
            errors,
            duration,
            results: results.slice(0, 3)  // Only return first 3 for brevity
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
