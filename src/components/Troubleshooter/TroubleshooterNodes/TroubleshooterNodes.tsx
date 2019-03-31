import React, { FunctionComponent } from 'react';
import { TroubleshooterItem } from '../../../models/troubleshooter-item';
import TroubleshooterNode from './TroubleshooterNode';
import TroubleshooterHelpButton from './TroubleshooterHelpButton';
import './TroubleshooterNodes.scss';

interface Props {
  items: TroubleshooterItem[];
}

const TroubleshooterNodes: FunctionComponent<Props> = ({ items }) => {
  if (items.length > 0) {
    return (
      <div className="troubleshooter-nodes">
        {items.map(item => (
          <TroubleshooterNode key={item.id} item={item} />
        ))}
      </div>
    );
  }
  return <TroubleshooterHelpButton />;
};

export default TroubleshooterNodes;
