import {
  browseCategories,
  siteCopy,
  type BrowseCategory,
  type Product,
} from "@/content/site-copy";

/**
 * The search behind the nav field and the hero field.
 *
 * Both controls run this, so they can never disagree about what matches. It is
 * a plain function over the eight example listings that are already in the
 * bundle — there is no index, no request and no backend, because there is
 * nothing to ask. When real listings arrive this is the single place that has
 * to change, and both fields change with it.
 *
 * A product matches on its name, its description, or the label of the category
 * it sits in. The category label matters: "healthcare" appears in neither the
 * name nor the description of the healthcare listing, so without it the most
 * obvious query for that product would return nothing.
 */

/** "All categories" — the reset value for the category constraint. */
export const ALL_CATEGORIES = "all";

const categoryLabels = new Map(
  browseCategories.map((category) => [category.id, category.label]),
);

/**
 * Which browse category a product belongs to.
 *
 * Products carry a `ProductCategory`, and every one of those is also a browse
 * category id, so the product's own category is the answer. Kept as a function
 * rather than inlined because both the matcher and the cards need it.
 */
export function categoryLabelFor(product: Product): string {
  return categoryLabels.get(product.category) ?? product.category;
}

/** Case- and whitespace-insensitive, which is all the query needs to be. */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesQuery(product: Product, query: string): boolean {
  if (!query) return true;
  const haystack = [
    product.name,
    product.description,
    categoryLabelFor(product),
  ]
    .join(" ")
    .toLowerCase();
  /*
   * Every whitespace-separated term has to appear somewhere, so "retail
   * forecasting" narrows rather than widens. Substring rather than word-prefix
   * matching, so "chat" finds "Chatbot".
   */
  return query.split(/\s+/).every((term) => haystack.includes(term));
}

function matchesCategory(product: Product, categoryId: string): boolean {
  return categoryId === ALL_CATEGORIES || product.category === categoryId;
}

export type SearchCriteria = {
  query: string;
  /** A `BrowseCategory.id`, or `ALL_CATEGORIES`. */
  categoryId: string;
};

/**
 * The listings matching both the query and the selected category.
 *
 * Source order is preserved — there is no relevance ranking, because with
 * eight items ranking would be invented precision rather than help.
 */
export function searchProducts(
  products: Product[],
  { query, categoryId }: SearchCriteria,
): Product[] {
  const normalized = normalize(query);
  return products.filter(
    (product) =>
      matchesCategory(product, categoryId) && matchesQuery(product, normalized),
  );
}

/** The eight example listings, searched with the same rules. */
export function searchExampleListings(criteria: SearchCriteria): Product[] {
  return searchProducts(siteCopy.marketplace.products.items, criteria);
}

/**
 * Where a listing's search result points.
 *
 * Individual product pages do not exist, so the closest real destination is
 * the marketplace filtered to that product's category. Do not point these at
 * `product.href` — that is "#", and a result that goes nowhere is worse than
 * one that goes somewhere adjacent.
 */
export function resultHref(product: Product): string {
  return `/marketplace?category=${product.category}`;
}

/**
 * Options for the category `<select>` beside the nav's search field: all nine
 * browse categories, with the reset option first.
 *
 * Categories with nothing listed are included deliberately. They are real
 * parts of the taxonomy, and narrowing to one returns no matches — which is
 * the honest answer, not a broken state.
 */
export const searchCategoryOptions: BrowseCategory[] = browseCategories;
