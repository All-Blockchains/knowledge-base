import React, { FunctionComponent } from 'react';
import { TroubleshooterItem } from '../../../models/troubleshooter-item';
import { Link } from 'gatsby';
import './TroubleshooterBack.scss';

interface Props {
  item: TroubleshooterItem;
}

const TroubleshooterBack: FunctionComponent<Props> = ({ item }) => {
  if (item.parent) {
    return (
      <Link className="troubleshooter-back" to={`/${item.parent.slug}`}>
        Back
      </Link>
    );
  }

  return null;
};

export default TroubleshooterBack;
