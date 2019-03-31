const crypto = require('crypto');
const minimatch = require('minimatch');
const removeMarkdown = require('remove-markdown');

/**
 * Get a sha256 hash from an input string.
 *
 * @param input
 * @returns {string}
 */
const createHash = input => {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');
};

/**
 * Create node data that can be used with `createNode`.
 *
 * @param data
 * @param id
 * @param type
 * @param actions
 * @return {{id: *, children: Array, internal: {type: *, content: string, contentDigest: string}}}
 */
const createNodeData = (data, id, type, actions) => {
  const { createNodeId } = actions;

  const nodeContent = JSON.stringify(data);

  return {
    ...data,
    id: createNodeId(id),
    children: [],
    internal: {
      type,
      content: nodeContent,
      contentDigest: createHash(nodeContent)
    }
  };
};

/**
 * Get markdown data from a File node.
 *
 * @param node
 * @param actions
 * @return {*}
 */
const getMarkdownData = (node, actions) => {
  const { getNode } = actions;

  return node.children
    .map(child => getNode(child))
    .find(child => child.internal.type === 'MarkdownRemark');
};

/**
 * Get excerpt from a page data object.
 *
 * @param pageData
 */
const getExcerpt = pageData => {
  return (
    removeMarkdown(pageData.rawMarkdownBody)
      .slice(0, 200)
      .replace(/[\r\n]+/g, ' ') + '...'
  );
};

/**
 * Get all files in a category from File nodes.
 *
 * @param nodes
 * @param pattern
 * @param parent
 * @param actions
 * @return {*}
 */
const getPages = (nodes, pattern, parent, actions) => {
  const { createNode } = actions;

  const pages = [];

  nodes
    .filter(node => node.internal.type === 'File' && node.extension === 'md')
    .filter(node => minimatch(node.relativeDirectory, pattern))
    .forEach(node => {
      const pageData = getMarkdownData(node, actions);

      const slug = node.relativePath.replace(/\.md$/, '');
      const excerpt = getExcerpt(pageData);

      const parsedPageData = {
        title: pageData.frontmatter.title,
        filename: node.name,
        description: pageData.frontmatter.description,
        excerpt,
        priority: pageData.frontmatter.priority,
        datePublished: pageData.frontmatter.date_published,
        dateModified: pageData.frontmatter.date_modified,
        slug,
        originalSlug: slug,
        parent: parent.id,
        parentSlug: parent.slug,
        breadcrumbs: [...parent.breadcrumbs]
      };

      parsedPageData.breadcrumbs.push({
        title: parsedPageData.title,
        slug: parsedPageData.slug
      });

      const pageNode = createNodeData(
        parsedPageData,
        `page-${parsedPageData.slug}`,
        'Page',
        actions
      );
      createNode(pageNode);

      pages.push(pageNode);
    });

  return pages;
};

/**
 * Get a single page by `slug`.
 *
 * @param nodes
 * @param slug
 */
const getPage = (nodes, slug) => {
  return nodes.filter(node => node.internal.type === 'Page').find(node => node.slug === slug);
};

/**
 * Get category data from a File node.
 * @param node
 * @param actions
 * @return {*}
 */
const getCategoryData = (node, actions) => {
  const { getNode } = actions;

  return node.children
    .map(child => getNode(child))
    .find(child => child.internal.type === 'CategoryData');
};

/**
 * Parse all file nodes to categories and return the categories and pages.
 *
 * @param nodes
 * @param pattern
 * @param parent
 * @param actions
 * @return {*}
 */
const getCategories = (nodes, pattern, parent, actions) => {
  const { createNode, createParentChildLink } = actions;

  return nodes
    .filter(
      node => node.internal.type === 'File' && node.name === 'category' && node.extension === 'yml'
    )
    .filter(node => minimatch(node.relativeDirectory, pattern))
    .map(node => {
      const categoryData = {
        ...getCategoryData(node, actions),
        parent: parent ? parent.id : null,
        parentSlug: parent ? parent.slug : null,
        slug: node.relativeDirectory,
        isTopLevel: !parent,
        breadcrumbs: []
      };

      if (parent) {
        categoryData.breadcrumbs.push(...parent.breadcrumbs);
      }

      categoryData.breadcrumbs.push({
        title: categoryData.title,
        slug: categoryData.slug
      });

      const categoryNode = createNodeData(
        categoryData,
        `category-${categoryData.slug}`,
        'Category',
        actions
      );
      createNode(categoryNode);

      // Get pages in the category
      const pages = getPages(nodes, categoryNode.slug, categoryNode, actions);
      pages.forEach(pageNode => {
        createParentChildLink({ parent: categoryNode, child: pageNode });
      });

      // Get subcategories
      const subCategories = getCategories(nodes, `${categoryNode.slug}/*`, categoryNode, actions);
      subCategories.forEach(subCategoryNode => {
        createParentChildLink({ parent: categoryNode, child: subCategoryNode });
      });

      return categoryNode;
    });
};

/**
 * Create a new troubleshooter node including all sub-nodes.
 *
 * @param nodes
 * @param parent
 * @param isFirst
 * @param actions
 * @returns {*}
 */
const createTroubleshooterNode = (nodes, parent, isFirst, actions) => {
  const { createNode, createParentChildLink } = actions;

  const parentMarkdown = getMarkdownData(parent, actions);
  const parentNode = createNodeData(
    {
      title: parentMarkdown.frontmatter.title,
      description: parentMarkdown.frontmatter.description,
      priority: parentMarkdown.frontmatter.priority || 0,
      absolutePath: parent.absolutePath,
      relativePath: parent.relativePath,
      slug: isFirst
        ? 'troubleshooter'
        : `troubleshooter/${createHash(parent.relativePath).slice(0, 8)}`
    },
    `troubleshooter-node-${parent.relativeDirectory || 'root'}`,
    'TroubleshooterNode',
    actions
  );
  createNode(parentNode);

  nodes.filter(node => minimatch(node.dir, `${parent.dir}/*`)).map(node => {
    const subNode = createTroubleshooterNode(nodes, node, false, actions);
    subNode.parent = parentNode.id;
    subNode.parentSlug = parentNode.slug;

    createParentChildLink({ parent: parentNode, child: subNode });
  });

  return parentNode;
};

/**
 * Register all troubleshooter nodes as GraphQL node.
 *
 * @param allNodes
 * @param pattern
 * @param actions
 */
const getTroubleshooterNodes = (allNodes, pattern, actions) => {
  const { reporter } = actions;

  const nodes = allNodes.filter(
    node => node.internal.type === 'File' && node.sourceInstanceName === 'troubleshooter'
  );

  const parent = nodes.find(node => node.relativeDirectory === pattern);
  if (!parent) {
    return reporter.warn('No troubleshooter content found');
  }

  createTroubleshooterNode(nodes, parent, true, actions);
};

const registerLinks = (nodes, actions) => {
  const { createNode, createParentChildLink } = actions;

  return nodes
    .filter(node => node.internal.type === 'Category')
    .filter(node => node.links)
    .forEach(category => {
      category.links.forEach(link => {
        const page = { ...getPage(nodes, link) };
        page.parent = category.id;
        page.parentSlug = category.slug;
        page.slug = `${category.slug}/${page.filename}`;
        page.breadcrumbs = [...category.breadcrumbs];

        page.breadcrumbs.push({
          title: page.title,
          slug: page.slug
        });

        const newPageNode = createNodeData(page, `page-${page.slug}`, 'Page', actions);
        createNode(newPageNode);
        createParentChildLink({ parent: category, child: newPageNode });
      });
    });
};

module.exports = ({ actions, getNodes, ...rest }) => {
  const gatsbyActions = { getNodes, ...actions, ...rest };

  const nodes = getNodes();
  getCategories(nodes, '*', null, gatsbyActions);
  getTroubleshooterNodes(nodes, '', gatsbyActions);

  // Get nodes including new categories and pages
  const newNodes = getNodes();
  registerLinks(newNodes, gatsbyActions);
};
