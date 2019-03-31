import React, { DetailedHTMLProps, FunctionComponent, HTMLAttributes } from 'react';
import './Button.scss';

type ButtonProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
type Props = Pick<ButtonProps, Exclude<keyof ButtonProps, 'className'>>;

const Button: FunctionComponent<Props> = ({ children, ...rest }) => (
  <div className="button primary" {...rest}>
    {children}
  </div>
);

export default Button;
