const Parser = require('rss-parser');
const cheerio = require('cheerio');

class KoreanScraper {
    constructor() {
        this.parser = new Parser();
        this.newsUrl = process.env.NEWS_SOURCE_URL || 
            'https://www.yonhapnewstv.co.kr/category/news/headline/feed/';
    }

    /**
     * Extract Korean vocabulary from RSS feed
     */
    async scrapeVocabulary(maxItems = 5) {
        try {
            console.log(`📰 Fetching Korean news from ${this.newsUrl}`);
            
            const feed = await this.parser.parseURL(this.newsUrl);
            const vocabularySet = new Set();

            // Process only first few items
            const items = feed.items.slice(0, maxItems);

            for (const item of items) {
                const title = item.title || '';
                const description = item.contentSnippet || item.description || '';
                
                // Extract Korean words
                const words = this.extractKoreanWords(title + ' ' + description);
                words.forEach(word => vocabularySet.add(word));
            }

            const vocabulary = Array.from(vocabularySet);
            console.log(`📚 Extracted ${vocabulary.length} unique Korean words`);
            
            return vocabulary;

        } catch (error) {
            console.error(`❌ Scraping error: ${error.message}`);
            return [];
        }
    }

    /**
     * Extract meaningful Korean words from text
     */
    extractKoreanWords(text) {
        // Remove HTML tags
        const cleanText = text.replace(/<[^>]*>/g, '');
        
        // Korean word pattern: 2+ Korean characters
        const koreanPattern = /[가-힣]{2,}/g;
        const words = cleanText.match(koreanPattern) || [];
        
        // Filter out common particles and very long words
        const filtered = words.filter(word => {
            return word.length >= 2 && 
                   word.length <= 15 && 
                   !this.isCommonParticle(word);
        });
        
        return filtered;
    }

    /**
     * Check if word is a common Korean particle (to be filtered out)
     */
    isCommonParticle(word) {
        const particles = ['이다', '있다', '없다', '하다', '되다', '그리고', '그러나', '그래서'];
        return particles.includes(word);
    }

    /**
     * Get source URL for attribution
     */
    getSourceName() {
        return 'Yonhap News';
    }
}

module.exports = KoreanScraper;