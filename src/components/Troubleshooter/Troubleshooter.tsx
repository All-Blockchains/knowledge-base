import React, { FunctionComponent } from 'react';
import { TroubleshooterItem } from '../../models/troubleshooter-item';
import TroubleshooterNodes from './TroubleshooterNodes';
import TroubleshooterBack from './TroubleshooterBack';

interface Props {
  item: TroubleshooterItem;
  subItems: TroubleshooterItem[];
  body: string;
}

const Troubleshooter: FunctionComponent<Props> = ({ item, subItems, body }) => (
  <>
    <h2>{item.title}</h2>
    <div dangerouslySetInnerHTML={{ __html: body }} />
    <TroubleshooterNodes items={subItems} />
    <TroubleshooterBack item={item} />
  </>
);

export default Troubleshooter;
