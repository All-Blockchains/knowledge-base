export interface TroubleshooterItem {
  /**
   * The title of the item.
   */
  title: string;

  /**
   * The optional description of the item.
   */
  description?: string;

  /**
   * A unique identifier for the item.
   */
  id: string;

  /**
   * The slug for the item.
   */
  slug: string;

  /**
   * The parent of the item. This is null if there is no parent (e.g. top level item).
   */
  parent?: {
    /**
     * The slug for the parent (previous item).
     */
    slug: string;
  };
}
