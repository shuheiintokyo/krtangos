const axios = require('axios');

class Translator {
    constructor() {
        this.papagoClientId = process.env.PAPAGO_CLIENT_ID;
        this.papagoClientSecret = process.env.PAPAGO_CLIENT_SECRET;
    }

    /**
     * Translate Korean to Japanese using Papago API
     */
    async translateToJapanese(koreanText) {
        try {
            const response = await axios.post(
                'https://openapi.naver.com/v1/papago/n2mt',
                {
                    source: 'ko',
                    target: 'ja',
                    text: koreanText
                },
                {
                    headers: {
                        'X-Naver-Client-Id': this.papagoClientId,
                        'X-Naver-Client-Secret': this.papagoClientSecret,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const translatedText = response.data.message.result.translatedText;
            console.log(`🌐 Translated: ${koreanText} → ${translatedText}`);
            return translatedText;

        } catch (error) {
            console.error(`❌ Translation error: ${error.message}`);
            
            // Fallback: return Korean text if translation fails
            return koreanText;
        }
    }

    /**
     * Batch translate multiple Korean texts
     */
    async batchTranslate(koreanTexts) {
        const translations = [];
        
        for (const text of koreanTexts) {
            const translation = await this.translateToJapanese(text);
            translations.push(translation);
            
            // Rate limiting: wait 100ms between translations
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return translations;
    }
}

module.exports = Translator;