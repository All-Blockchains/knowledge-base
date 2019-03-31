import React, { FunctionComponent } from 'react';
import { TroubleshooterItem } from '../../../../models/troubleshooter-item';
import { Link } from 'gatsby';
import './TroubleshooterNode.scss';
import Caret from '../../../ui/Caret/Caret';

interface Props {
  item: TroubleshooterItem;
}

const TroubleshooterNode: FunctionComponent<Props> = ({ item }) => (
  <Link to={`/${item.slug}`} className="troubleshooter-node">
    {item.title}
    {item.description && <div className="troubleshooter-node-description">{item.description}</div>}
    <div className="troubleshooter-node-caret">
      <Caret />
    </div>
  </Link>
);

export default TroubleshooterNode;
