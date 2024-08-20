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
			key={1}
			ref={(node) => {
				if (node) {
					ref.current = node;
				}
			}}
			disabled
			aria-label='some label'
			data-test-id='button'
			className={cn(
				styles.root,
				styles[`size_${size}`],
				styles[`color_${color}`],
				{ [styles.disabled]: disabled }
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};
