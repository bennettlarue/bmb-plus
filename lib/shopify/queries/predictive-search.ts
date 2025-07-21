import productFragment from '../fragments/product';

export const predictiveSearchQuery = /* GraphQL */ `
  query predictiveSearch($query: String!, $limit: Int = 10, $types: [PredictiveSearchType!]) {
    predictiveSearch(query: $query, limit: $limit, types: $types) {
      queries {
        text
        styledText
      }
      products {
        ...product
      }
      collections {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
        description
      }
      pages {
        id
        title
        handle
        body
      }
      articles {
        id
        title
        handle
        excerpt
        image {
          url
          altText
          width
          height
        }
        publishedAt
        blog {
          title
        }
      }
    }
  }
  ${productFragment}
`;

export const predictiveSearchProductsOnlyQuery = /* GraphQL */ `
  query predictiveSearchProductsOnly($query: String!, $limit: Int = 4) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT]) {
      queries {
        text
        styledText
      }
      products {
        ...product
      }
    }
  }
  ${productFragment}
`;