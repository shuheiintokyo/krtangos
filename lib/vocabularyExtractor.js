class VocabularyExtractor {
    /**
     * Select the best vocabulary words for learning
     */
    selectBestWords(words, maxWords = 20) {
        // Filter and score words
        const scored = words.map(word => ({
            word,
            score: this.scoreWord(word)
        }));

        // Sort by score (highest first)
        scored.sort((a, b) => b.score - a.score);

        // Take top N words
        return scored.slice(0, maxWords).map(item => item.word);
    }

    /**
     * Score word based on learning value
     */
    scoreWord(word) {
        let score = 0;

        // Prefer medium-length words (3-6 characters)
        const length = word.length;
        if (length >= 3 && length <= 6) {
            score += 10;
        } else if (length === 2 || length === 7) {
            score += 5;
        }

        // Penalize very common words
        if (this.isVeryCommon(word)) {
            score -= 5;
        }

        // Boost nouns (words ending in common noun endings)
        if (this.isLikelyNoun(word)) {
            score += 3;
        }

        return score;
    }

    /**
     * Check if word is very common (basic words)
     */
    isVeryCommon(word) {
        const common = [
            '오늘', '내일', '어제', '지금', '여기', '저기',
            '사람', '우리', '저희', '이것', '그것', '저것'
        ];
        return common.includes(word);
    }

    /**
     * Check if word is likely a noun
     */
    isLikelyNoun(word) {
        // Korean noun endings
        const nounEndings = ['음', '이', '자', '가', '도'];
        return nounEndings.some(ending => word.endsWith(ending));
    }
}

module.exports = VocabularyExtractor;