const axios = require('axios');

class Translator {
    async translateToJapanese(koreanText) {
        try {
            const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
                params: {
                    client: 'gtx',
                    sl: 'ko',
                    tl: 'ja',
                    dt: 't',
                    q: koreanText
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                },
                timeout: 5000  // 5 second timeout
            });

            const translatedText = response.data[0][0][0];
            console.log(`🌐 Translated: ${koreanText} → ${translatedText}`);
            return translatedText;

        } catch (error) {
            console.error(`❌ Translation error: ${error.message}`);
            return koreanText;
        }
    }

    async batchTranslate(koreanTexts) {
        const translations = [];
        
        for (const text of koreanTexts) {
            const translation = await this.translateToJapanese(text);
            translations.push(translation);
            
            // Reduced delay from 300ms to 100ms
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return translations;
    }
}

module.exports = Translator;