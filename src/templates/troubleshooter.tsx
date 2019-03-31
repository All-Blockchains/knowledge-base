import React, { FunctionComponent } from 'react';
import MetaData from '../components/MetaData/MetaData';
import Header from '../components/Header/Header';
import SubHeader from '../components/SubHeader/SubHeader';
import { graphql, Link } from 'gatsby';
import Layout from '../components/Layout/Layout';
import { TroubleshooterItem } from '../models/troubleshooter-item';
import Troubleshooter from '../components/Troubleshooter/Troubleshooter';

interface Props {
  pathContext: {
    id: string;
  };
  data: {
    troubleshooterNode: TroubleshooterItem;
    allTroubleshooterNode: {
      edges: {
        node: TroubleshooterItem;
      }[];
    };
    file: {
      childMarkdownRemark: {
        html: string;
      };
    };
  };
}

const Node: FunctionComponent<Props> = ({
  data: { troubleshooterNode, allTroubleshooterNode, file }
}) => {
  const subItems =
    (allTroubleshooterNode && allTroubleshooterNode.edges.map(edge => edge.node)) || [];

  return (
    <Layout>
      <div className="full-width">
        <MetaData title="Troubleshooting" noIndex={troubleshooterNode.parent !== null} />

        <Header />
        <SubHeader>
          <div className="container">
            <div className="row center-xs">
              <div className="col-xs-10 col-gutter-lr">
                <div className="breadcrumbs">
                  <li>
                    <Link to="/">Knowledge Base</Link>
                  </li>
                  <li>
                    <Link to="/troubleshooter">Troubleshooting</Link>
                  </li>
                </div>
              </div>
            </div>
          </div>
        </SubHeader>

        <div className="container">
          <div className="category row center-xs">
            <div className="col-xs-10 col-md-6 col-gutter-lr">
              <section>
                <Troubleshooter
                  item={troubleshooterNode}
                  subItems={subItems}
                  body={file.childMarkdownRemark.html}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query TroubleshooterNode($slug: String!, $relativePath: String!) {
    troubleshooterNode(slug: { eq: $slug }) {
      id
      title
      parent {
        ... on TroubleshooterNode {
          slug
        }
      }
    }

    allTroubleshooterNode(
      filter: { parentSlug: { eq: $slug } }
      sort: { fields: [priority], order: DESC }
    ) {
      edges {
        node {
          id
          title
          description
          priority
          id
          slug
        }
      }
    }

    file(relativePath: { eq: $relativePath }, sourceInstanceName: { eq: "troubleshooter" }) {
      childMarkdownRemark {
        html
      }
    }
  }
`;

export default Node;
