import { Product } from '../types';

export interface PredictiveSearchQuerySuggestion {
  text: string;
  styledText: string;
}

export interface PredictiveSearchCollection {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  description: string;
}

export interface PredictiveSearchPage {
  id: string;
  title: string;
  handle: string;
  body: string;
}

export interface PredictiveSearchArticle {
  id: string;
  title: string;
  handle: string;
  excerpt?: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  publishedAt: string;
  blog: {
    title: string;
  };
}

export interface PredictiveSearchResult {
  queries: PredictiveSearchQuerySuggestion[];
  products: Product[];
  collections: PredictiveSearchCollection[];
  pages: PredictiveSearchPage[];
  articles: PredictiveSearchArticle[];
}

export interface ShopifyPredictiveSearchOperation {
  data: {
    predictiveSearch: PredictiveSearchResult;
  };
  variables: {
    query: string;
    limit?: number;
    types?: string[];
  };
}

export type PredictiveSearchType = 'ARTICLE' | 'COLLECTION' | 'PAGE' | 'PRODUCT' | 'QUERY';