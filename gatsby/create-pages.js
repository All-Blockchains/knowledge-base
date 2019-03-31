const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');
const fs = require('fs');

const TEMPLATE_DIR = path.resolve(__dirname, '../src/templates');
const CONTENT_DIR = path.resolve(__dirname, '../src/content');

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
      contentDigest: crypto
        .createHash('md5')
        .update(nodeContent)
        .digest('hex')
    }
  };
};

/**
 * Get all pages.
 *
 * @param actions
 * @return {Promise<*[]>}
 */
const getPages = async actions => {
  const { graphql } = actions;

  const {
    data: {
      allPage: { edges }
    }
  } = await graphql(`
    query Pages {
      allPage {
        edges {
          node {
            id
            title
            slug
            originalSlug
          }
        }
      }
    }
  `);

  return edges.map(edge => edge.node);
};

/**
 * Register a page to Gatsby.
 *
 * @param page
 * @param actions
 */
const registerPage = (page, actions) => {
  const { createPage } = actions;

  createPage({
    path: `/${page.slug}`,
    component: path.join(TEMPLATE_DIR, 'page.tsx'),
    context: {
      slug: page.slug,
      file: `${page.originalSlug}.md`
    }
  });
};

/**
 * Get all icons in `assets/images/icons` and parse them as a key-value object.
 *
 * @param actions
 * @return {Promise<*>}
 */
const getIcons = async actions => {
  const { graphql } = actions;

  const result = await graphql(`
    query IconsQuery {
      allFile(
        filter: { sourceInstanceName: { eq: "images" }, relativeDirectory: { eq: "icons" } }
      ) {
        edges {
          node {
            name
            publicURL
          }
        }
      }
    }
  `);

  return result.data.allFile.edges.reduce((target, current) => {
    target[current.node.name] = current.node.publicURL;
    return target;
  }, {});
};

/**
 * Add icon to categories.
 *
 * @param actions
 * @return {void}
 */
const addIconsToCategories = async actions => {
  const { getNodes, createNode, createParentChildLink } = actions;

  const nodes = getNodes();
  const icons = await getIcons(actions);

  nodes.filter(node => node.internal.type === 'Category').forEach(category => {
    const iconData = {
      icon: icons[category.icon],
      parent: category.id
    };

    const node = createNodeData(iconData, `icon-data-${category.slug}`, `IconData`, actions);
    createNode(node);
    createParentChildLink({ parent: category, child: node });
  });
};

const getCategories = async actions => {
  const { graphql } = actions;

  const {
    data: {
      allCategory: { edges }
    }
  } = await graphql(`
    query Categories {
      allCategory {
        edges {
          node {
            slug
          }
        }
      }
    }
  `);

  return edges.map(edge => edge.node);
};

/**
 * Register a category to Gatsby.
 *
 * @param category
 * @param actions
 */
const registerCategory = (category, actions) => {
  const { createPage } = actions;

  createPage({
    path: `/${category.slug}`,
    component: path.join(TEMPLATE_DIR, 'category.tsx'),
    context: {
      slug: category.slug
    }
  });
};

/**
 * Register a troubleshooter page to Gatsby.
 *
 * @param troubleshooterNode
 * @param actions
 */
const registerTroubleshooterNode = (troubleshooterNode, actions) => {
  const { createPage } = actions;

  createPage({
    path: `/${troubleshooterNode.slug}`,
    component: path.join(TEMPLATE_DIR, 'troubleshooter.tsx'),
    context: {
      slug: troubleshooterNode.slug,
      relativePath: troubleshooterNode.relativePath
    }
  });
};

/**
 * Register all troubleshooter nodes to Gatsby.
 *
 * @param actions
 * @returns {Promise<void>}
 */
const registerTroubleshooterNodes = async actions => {
  const { graphql } = actions;

  const { data } = await graphql(`
    query {
      allTroubleshooterNode {
        edges {
          node {
            absolutePath
            relativePath
            slug
          }
        }
      }
    }
  `);

  if (data) {
    data.allTroubleshooterNode.edges
      .map(edge => edge.node)
      .forEach(node => registerTroubleshooterNode(node, actions));
  }
};

/**
 * Register top level redirects (from `redirects.yml` to Gatsby.
 *
 * @param actions
 */
const registerTopLevelRedirects = actions => {
  const { createRedirect, reporter } = actions;

  let file;
  try {
    file = fs.readFileSync(path.resolve(CONTENT_DIR, 'redirects.yml'), 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      reporter.warn('`redirects.yml` file not found, redirects will not be registered');
    } else {
      reporter.panic(error);
    }
  }

  if (file) {
    const document = yaml.safeLoad(file);

    document.redirects.forEach(redirect => {
      createRedirect({
        fromPath: `/${redirect.from}`,
        toPath: `/${redirect.to}`,
        isPermanent: true,
        redirectInBrowser: true
      });
    });
  }
};

/**
 * Setup redirects for a page.
 *
 * @param page
 * @param actions
 * @return {void}
 */
const registerPageRedirects = (page, actions) => {
  const { createRedirect } = actions;

  createRedirect({
    fromPath: `/${page.slug}.html`,
    toPath: `/${page.slug}`,
    isPermanent: true,
    redirectInBrowser: true
  });
};

module.exports = async ({ actions, ...rest }) => {
  const gatsbyActions = {
    ...actions,
    ...rest
  };

  await addIconsToCategories(gatsbyActions);
  const categories = await getCategories(gatsbyActions);
  categories.forEach(category => {
    registerCategory(category, gatsbyActions);
  });

  const pages = await getPages(gatsbyActions);
  pages.forEach(page => {
    registerPage(page, gatsbyActions);
    registerPageRedirects(page, gatsbyActions);
  });

  await registerTroubleshooterNodes(gatsbyActions);

  registerTopLevelRedirects(gatsbyActions);
};
