class SentenceExtractor {
    selectBestSentences(sentences, maxSentences = 10) {
        // Remove duplicates
        const uniqueSentences = [...new Set(sentences)];
        
        const scored = uniqueSentences.map(sentence => ({
            sentence,
            score: this.scoreSentence(sentence)
        }));

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, maxSentences).map(item => item.sentence);
    }

    scoreSentence(sentence) {
        let score = 0;

        // Prefer medium-length sentences (easier to learn)
        const length = sentence.length;
        if (length >= 20 && length <= 80) {
            score += 15;
        } else if (length >= 10 && length <= 100) {
            score += 10;
        } else if (length > 100) {
            score += 5;
        }

        // Count Korean words
        const koreanWords = (sentence.match(/[가-힣]{2,}/g) || []).length;
        if (koreanWords >= 3 && koreanWords <= 15) {
            score += 10;
        }

        // Bonus for complete sentences with proper endings
        if (sentence.match(/[다요]\s*[.!?]?\s*$/)) {
            score += 5;
        }

        // Penalty for questions (slightly harder for beginners)
        if (sentence.includes('?')) {
            score -= 2;
        }

        // Bonus for sentences with common useful patterns
        const usefulPatterns = ['입니다', '있습니다', '했습니다', '합니다', '이다', '하다'];
        if (usefulPatterns.some(pattern => sentence.includes(pattern))) {
            score += 3;
        }

        // Penalty for too many numbers or special characters
        const specialChars = (sentence.match(/[0-9%$@#]/g) || []).length;
        if (specialChars > 3) {
            score -= 5;
        }

        return score;
    }
}

module.exports = SentenceExtractor;
