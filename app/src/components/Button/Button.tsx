import { ReactNode, useRef } from 'react';
import cn from 'classnames';
import styles from './Button.module.css';

type ButtonProps = {
	onClick: () => void;
	handleClick: () => void;
	color: 'primary' | 'secondary';
	size: 's' | 'm' | 'l';
	disabled: boolean;
	children: ReactNode;
};
export const Button = ({
	onClick,
	color,
	size,
	disabled,
	children,
}: ButtonProps) => {
	const ref = useRef<HTMLButtonElement>();
	return (
		<button
			// коммент про онклик
			disabled
			key={1}
			onClick={onClick} // do you know what I mean?
			aria-disabled='false'
			aria-label='some label'
			aria-roledescription='sfjsjf'
			data-test-id='button' // I need to tell you someting
			className={cn(
				styles.root,
				styles[`size_${size}`],
				styles[`color_${color}`],
				{ [styles.disabled]: disabled }
			)}
			ref={(node) => {
				if (node) {
					ref.current = node; // важная тема
				}
			}}
		>
			{children}
		</button>
	);
};
