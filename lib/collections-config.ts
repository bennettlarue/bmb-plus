export interface DynamicCollection {
  handle: string;
  title: string;
  description: string;
  heroImage?: string;
  filters: {
    tags?: string[];
    types?: string[];
    vendors?: string[];
    searchQuery?: string;
  };
  featuredProductHandles?: string[];
  seo: {
    title: string;
    description: string;
  };
}

export const collectionsConfig: DynamicCollection[] = [
  {
    handle: 'wine-champagne',
    title: 'Wine & Champagne',
    description: 'Elegant glassware for wine enthusiasts. From stemmed classics to modern stemless designs.',
    filters: {
      tags: ['Wine', 'Wine Glasses', 'Stemware'],
      searchQuery: 'wine OR champagne OR flute'
    },
    seo: {
      title: 'Wine & Champagne Glasses | Custom Branded Wine Glasses',
      description: 'Premium wine glasses and champagne flutes with custom branding. Stemmed, stemless, and champagne options for events and gifts.'
    }
  },
  {
    handle: 'beer-spirits',
    title: 'Beer & Spirits',
    description: 'Craft beer glasses, shot glasses, and cocktail glassware for bars and events.',
    filters: {
      tags: ['Beer', 'Beer Accessories', 'Bar', 'Shot Glasses'],
      searchQuery: 'beer OR shot OR cocktail OR spirits'
    },
    seo: {
      title: 'Beer & Spirits Glasses | Custom Bar Glassware',
      description: 'Custom branded beer glasses, shot glasses, and cocktail glassware. Perfect for bars, breweries, and promotional events.'
    }
  },
  {
    handle: 'everyday-drinkware',
    title: 'Everyday Drinkware',
    description: 'Versatile tumblers, mugs, and water glasses for daily use.',
    filters: {
      tags: ['Drinkware', 'Glasses-Drinking'],
      searchQuery: 'tumbler OR mug OR water glass OR rocks glass',
      types: ['Glass', 'Ceramic']
    },
    seo: {
      title: 'Everyday Drinkware | Custom Tumblers & Mugs',
      description: 'Custom branded tumblers, coffee mugs, and water glasses. Durable drinkware for offices, events, and daily use.'
    }
  },
  {
    handle: 'serveware-accessories',
    title: 'Serveware & Accessories',
    description: 'Serving essentials including trays, pitchers, and bar accessories.',
    filters: {
      searchQuery: 'serving OR tray OR pitcher OR carafe OR bucket OR caddy OR board',
      types: ['Bamboo', 'Plastic', 'Metal']
    },
    seo: {
      title: 'Serveware & Bar Accessories | Custom Serving Solutions',
      description: 'Custom branded serving trays, pitchers, and bar accessories. Professional serveware for restaurants and events.'
    }
  },
  {
    handle: 'wedding-favors',
    title: 'Wedding Favors',
    description: 'Memorable glassware gifts for your special day.',
    filters: {
      tags: ['Wedding'],
      searchQuery: 'wedding'
    },
    seo: {
      title: 'Wedding Favor Glasses | Custom Wedding Drinkware',
      description: 'Personalized wedding favor glasses. Create memorable gifts with custom branded glassware for your special day.'
    }
  },
  {
    handle: 'corporate-gifts',
    title: 'Corporate Gifts',
    description: 'Professional drinkware for corporate branding and client gifts.',
    filters: {
      tags: ['Restaurant Items'],
      searchQuery: 'corporate OR gift OR executive'
    },
    seo: {
      title: 'Corporate Gift Drinkware | Custom Branded Business Gifts',
      description: 'Premium corporate gift drinkware with custom branding. Professional glassware for client gifts and company events.'
    }
  }
];

export function getCollectionByHandle(handle: string): DynamicCollection | undefined {
  return collectionsConfig.find(collection => collection.handle === handle);
}

export function getAllCollectionHandles(): string[] {
  return collectionsConfig.map(collection => collection.handle);
}