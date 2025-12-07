const Parser = require('rss-parser');

class KoreanScraper {
    constructor() {
        this.parser = new Parser({
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        this.newsUrl = process.env.NEWS_SOURCE_URL || 
            'https://www.yonhapnewstv.co.kr/category/news/headline/feed/';
    }

    async scrapeSentences(maxArticles = 5) {
        try {
            console.log(`📰 Fetching Korean news from ${this.newsUrl}`);
            
            const feed = await this.parser.parseURL(this.newsUrl);
            const sentences = [];

            const items = feed.items.slice(0, maxArticles);

            for (const item of items) {
                const title = item.title || '';
                const description = item.contentSnippet || item.description || '';
                
                const extractedSentences = this.extractKoreanSentences(title + ' ' + description);
                sentences.push(...extractedSentences);
            }

            console.log(`📚 Extracted ${sentences.length} Korean sentences from ${items.length} articles`);
            
            return sentences;

        } catch (error) {
            console.error(`❌ Scraping error: ${error.message}`);
            return [];
        }
    }

    extractKoreanSentences(text) {
        // Clean HTML tags
        const cleanText = text.replace(/<[^>]*>/g, ' ');
        
        // Split by common Korean sentence endings: ., ?, !, 다, 요, 니다
        const sentencePattern = /[^.!?]*[.!?]|[가-힣][^.!?]*[다요]/g;
        const rawSentences = cleanText.match(sentencePattern) || [];
        
        const sentences = rawSentences
            .map(s => s.trim())
            .filter(s => {
                // Must contain Korean characters
                const hasKorean = /[가-힣]/.test(s);
                // Length between 10 and 150 characters
                const goodLength = s.length >= 10 && s.length <= 150;
                // Should have at least 2 Korean words
                const koreanWords = (s.match(/[가-힣]{2,}/g) || []).length;
                
                return hasKorean && goodLength && koreanWords >= 2;
            });
        
        return sentences;
    }

    getSourceName() {
        return 'Yonhap News';
    }
}

module.exports = KoreanScraper;
