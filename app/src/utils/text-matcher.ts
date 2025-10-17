const Fuse = require('fuse.js');

export interface KeywordMatch {
  keywordId: bigint;
  keyword: string;
  matchedText: string;
  preContext: string;
  postContext: string;
  score?: number;
}

export class TextMatcher {
  private readonly CONTEXT_LENGTH = 50;
  private readonly SCORE_THRESHOLD = 0.3;

  public findKeywordMatches(
    text: string,
    keyword: { id: bigint; keyword: string },
  ): KeywordMatch[] {
    const words = text.split(/\s+/);

    const options = {
      includeScore: true,
      includeMatches: true,
      threshold: this.SCORE_THRESHOLD,
      distance: Math.max(3, Math.floor(keyword.keyword.length / 2)),
      minMatchCharLength: Math.max(2, Math.floor(keyword.keyword.length * 0.5)),
    };

    try {
      // Create Fuse instance with the array of words
      const fuse = new Fuse(words, options);
      const fuseResults = fuse.search(keyword.keyword);
      console.log('Fuse results:', fuseResults);

      const matches: KeywordMatch[] = [];

      fuseResults.forEach((result) => {
        if (!result.matches?.length) return;

        // Get the word index in the original text
        const matchedWord = result.item;
        const matchPosition = text.indexOf(matchedWord);

        if (matchPosition === -1) return;

        const contextStart = Math.max(0, matchPosition - this.CONTEXT_LENGTH);
        const contextEnd = Math.min(
          text.length,
          matchPosition + matchedWord.length + this.CONTEXT_LENGTH,
        );

        matches.push({
          keywordId: keyword.id,
          keyword: keyword.keyword,
          matchedText: matchedWord,
          preContext: text.substring(contextStart, matchPosition),
          postContext: text.substring(
            matchPosition + matchedWord.length,
            contextEnd,
          ),
          score: result.score,
        });
      });

      // If no fuzzy matches but exact match exists, add it
      if (matches.length === 0) {
        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.keyword.toLowerCase();
        const exactMatchIndex = lowerText.indexOf(lowerKeyword);

        if (exactMatchIndex !== -1) {
          console.log('Adding exact match');
          const contextStart = Math.max(
            0,
            exactMatchIndex - this.CONTEXT_LENGTH,
          );
          const contextEnd = Math.min(
            text.length,
            exactMatchIndex + keyword.keyword.length + this.CONTEXT_LENGTH,
          );

          matches.push({
            keywordId: keyword.id,
            keyword: keyword.keyword,
            matchedText: text.substring(
              exactMatchIndex,
              exactMatchIndex + keyword.keyword.length,
            ),
            preContext: text.substring(contextStart, exactMatchIndex),
            postContext: text.substring(
              exactMatchIndex + keyword.keyword.length,
              contextEnd,
            ),
            score: 0, // Perfect match score
          });
        }
      }

      console.log('Final matches:', matches);
      return matches;
    } catch (error) {
      console.error('Error in matching:', error);
      return [];
    }
  }
}
