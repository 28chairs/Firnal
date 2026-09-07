export type SearchMatchSource = 'voice' | 'journal';

export type SearchResult = {
  date: string;
  title: string;
  snippet: string;
  matchSource: SearchMatchSource;
};
