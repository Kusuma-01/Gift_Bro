/**
 * Shopping Service & ShoppingProvider Abstraction for GiftBro AI
 * 
 * Supports generating direct merchant search URLs and provides an extensible
 * architecture for future direct product APIs (Amazon PA-API, Flipkart Affiliate, Google Merchant).
 */

/**
 * Abstract Shopping Provider Interface
 * Defines the contract for future live shopping API integrations.
 */
export class ShoppingProvider {
  async searchProducts(query) {
    throw new Error('searchProducts method must be implemented by concrete provider');
  }
  async getProductDetails(productId) {
    throw new Error('getProductDetails method must be implemented by concrete provider');
  }
  async getPrice(productId) {
    throw new Error('getPrice method must be implemented by concrete provider');
  }
  async getAvailability(productId) {
    throw new Error('getAvailability method must be implemented by concrete provider');
  }
}

/**
 * Platform configuration with URL templates and branding metadata
 */
export const SHOPPING_PLATFORMS = [
  {
    id: 'amazon',
    name: 'Amazon',
    badge: 'Fast Delivery',
    tagline: 'World’s largest retail marketplace',
    color: 'from-amber-500 to-orange-600',
    icon: '🛒',
    urlTemplate: 'https://www.amazon.com/s?k={query}',
    isAvailable: true,
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    badge: 'Popular Deals',
    tagline: 'India’s leading e-commerce store',
    color: 'from-blue-600 to-indigo-600',
    icon: '🛍️',
    urlTemplate: 'https://www.flipkart.com/search?q={query}',
    isAvailable: true,
  },
  {
    id: 'google',
    name: 'Google Shopping',
    badge: 'Compare Stores',
    tagline: 'Compare prices across multiple retailers',
    color: 'from-emerald-500 to-teal-600',
    icon: '🔎',
    urlTemplate: 'https://www.google.com/search?tbm=shop&q={query}',
    isAvailable: true,
  },
];

/**
 * SearchLinkShoppingProvider
 * Concrete provider that builds clean, targeted merchant search URLs.
 */
export class SearchLinkShoppingProvider extends ShoppingProvider {
  constructor(platforms = SHOPPING_PLATFORMS) {
    super();
    this.platforms = new Map(platforms.map(p => [p.id.toLowerCase(), p]));
  }

  /**
   * Cleans and optimizes the search query from gift data.
   * Keeps specific product keywords instead of collapsing to generic words.
   * Example: "Vintage Enamel Camping Mug" -> "Vintage Enamel Camping Mug"
   */
  buildSearchQuery(gift) {
    if (!gift) {
      throw new Error('Unable to create shopping search.');
    }

    const name = typeof gift === 'string' ? gift : gift.name;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Unable to create shopping search.');
    }

    // Clean up markdown fences or parenthetical labels if necessary
    let query = name.trim();
    // Normalize extra whitespace
    query = query.replace(/\s+/g, ' ');

    return query;
  }

  /**
   * Generates a validated, URL-encoded search link for the specified platform.
   */
  getShoppingUrl(platformKey, gift) {
    if (!platformKey || typeof platformKey !== 'string') {
      throw new Error('This shopping platform is currently unavailable.');
    }

    const platform = this.platforms.get(platformKey.toLowerCase().trim());
    if (!platform || !platform.isAvailable) {
      throw new Error('This shopping platform is currently unavailable.');
    }

    const cleanQuery = this.buildSearchQuery(gift);
    const encodedQuery = encodeURIComponent(cleanQuery);

    return platform.urlTemplate.replace('{query}', encodedQuery);
  }

  /**
   * Returns list of configured and available platforms
   */
  getSupportedPlatforms() {
    return Array.from(this.platforms.values()).filter(p => p.isAvailable);
  }
}

// Singleton provider instance for application use
export const defaultShoppingProvider = new SearchLinkShoppingProvider();

/**
 * Convenient helper function for generating shopping URLs safely
 */
export function getShoppingUrl(platform, gift) {
  return defaultShoppingProvider.getShoppingUrl(platform, gift);
}

/**
 * Convenient helper function to build search query safely
 */
export function buildSearchQuery(gift) {
  return defaultShoppingProvider.buildSearchQuery(gift);
}
