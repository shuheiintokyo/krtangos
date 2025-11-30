class VocabularyExtractor {
    selectBestWords(words, maxWords = 20) {
        const scored = words.map(word => ({
            word,
            score: this.scoreWord(word)
        }));

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, maxWords).map(item => item.word);
    }

    scoreWord(word) {
        let score = 0;

        const length = word.length;
        if (length >= 3 && length <= 6) {
            score += 10;
        } else if (length === 2 || length === 7) {
            score += 5;
        }

        if (this.isVeryCommon(word)) {
            score -= 5;
        }

        if (this.isLikelyNoun(word)) {
            score += 3;
        }

        return score;
    }

    isVeryCommon(word) {
        const common = [
            '오늘', '내일', '어제', '지금', '여기', '저기',
            '사람', '우리', '저희', '이것', '그것', '저것'
        ];
        return common.includes(word);
    }

    isLikelyNoun(word) {
        const nounEndings = ['음', '이', '자', '가', '도'];
        return nounEndings.some(ending => word.endsWith(ending));
    }
}

module.exports = VocabularyExtractor;