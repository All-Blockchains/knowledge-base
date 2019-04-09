import React, { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';

interface Subject {
  text: string;
  node?: string;
}

// TODO: Temporary subjects / troubleshooter node values
const SUBJECTS: Subject[] = [
  {
    text: 'Accessing wallet',
    node: 'accessing-wallet'
  },
  {
    text: 'Adding tokens',
    node: 'tokens/cannot-see-token'
  },
  {
    text: 'Coinbase buy widget'
  },
  {
    text: 'ENS',
    node: 'ens'
  },
  {
    text: 'Exchanging / exchanges'
  },
  {
    text: 'Getting started'
  },
  {
    text: 'Keystore file'
  },
  {
    text: 'Lost ETH / phishing / scam'
  },
  {
    text: 'Lost password',
    node: 'accessing-wallet/lost-password'
  },
  {
    text: 'Lost private key',
    node: 'accessing-wallet/lost-private-key'
  },
  {
    text: 'MetaMask'
  },
  {
    text: 'Nodes / networks'
  },
  {
    text: 'Private key'
  },
  {
    text: 'Sending transactions'
  },
  {
    text: 'Sending tokens'
  },
  {
    text: 'Swap'
  },
  {
    text: 'Other'
  }
];

interface Props {
  hasError: boolean;

  onChange(event: ChangeEvent<HTMLSelectElement>): void;
}

const SubjectField: FunctionComponent<Props> = ({ hasError, onChange }) => {
  const [subject, setSubject] = useState<string>('');
  const [node, setNode] = useState<string | undefined>(undefined);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSubject(event.currentTarget.value);
    setNode(event.currentTarget.dataset.node);
    onChange(event);
  };

  return (
    <div className={`field full-width ${hasError ? 'error' : ''}`}>
      <label htmlFor="form-subject">Subject</label>
      <select id="form-subject" name="subject" value={subject} onChange={handleChange}>
        <option value="">What can we help you with?</option>
        {SUBJECTS.map(item => (
          <option data-node={item.node}>{item.text}</option>
        ))}
      </select>
    </div>
  );
};

export default SubjectField;
