const axios = require('axios');

class Translator {
    /**
     * Translate Korean to Japanese using Google Translate (free, no API key)
     */
    async translateToJapanese(koreanText) {
        try {
            const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
                params: {
                    client: 'gtx',
                    sl: 'ko',  // Source: Korean
                    tl: 'ja',  // Target: Japanese
                    dt: 't',
                    q: koreanText
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const translatedText = response.data[0][0][0];
            console.log(`🌐 Translated: ${koreanText} → ${translatedText}`);
            return translatedText;

        } catch (error) {
            console.error(`❌ Translation error: ${error.message}`);
            // Fallback: return original text
            return koreanText;
        }
    }

    /**
     * Batch translate with rate limiting
     */
    async batchTranslate(koreanTexts) {
        const translations = [];
        
        for (const text of koreanTexts) {
            const translation = await this.translateToJapanese(text);
            translations.push(translation);
            
            // Rate limiting: wait 300ms between requests
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        return translations;
    }
}

module.exports = Translator;