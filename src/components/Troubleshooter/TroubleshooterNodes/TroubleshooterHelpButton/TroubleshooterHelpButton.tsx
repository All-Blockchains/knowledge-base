import React, { FunctionComponent, useState } from 'react';
import { Link } from 'gatsby';
import Button from '../../../ui/Button';

const TroubleshooterHelpButton: FunctionComponent = () => {
  const [isButtonPressed, setButtonPressed] = useState<boolean>(false);

  const handleClick = () => {
    setButtonPressed(true);
  };

  if (isButtonPressed) {
    return (
      <p>
        We're sorry to hear that you're still having issues. Feel free to{' '}
        <Link to="/contact-us">send us a message</Link> with additional information. Make sure to
        include any information we may require to help you, such as your Ethereum address or
        transaction IDs.
      </p>
    );
  }

  return <Button onClick={handleClick}>I still need help</Button>;
};

export default TroubleshooterHelpButton;
