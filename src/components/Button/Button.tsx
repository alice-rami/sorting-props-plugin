import { ReactNode, useRef } from 'react';
import cn from 'classnames';
import styles from './Button.module.css';

type ButtonProps = {
	onClick: () => void;
	onSubmit?: () => void;
	onFocus?: () => void;
	handleClick: () => void;
	color: 'primary' | 'secondary';
	size: 's' | 'm' | 'l';
	disabled: boolean;
	children: ReactNode;
	className?: string;
};
export const Button = ({
	color,
	size,
	disabled,
	onClick,
	children,
}: ButtonProps) => {
	const ref = useRef<HTMLButtonElement>();
	return (
		<button
			disabled
			onClick={onClick} // Some comment
			aria-disabled='false'
			aria-label='some label'
			aria-roledescription='sfjsjf'
			data-test-id='button' // Some comment
			key={1}
			ref={(node) => {
				if (node) {
					ref.current = node; // Some comment
				}
			}}
			className={cn(
				styles.root,
				styles[`size_${size}`],
				styles[`color_${color}`],
				{ [styles.disabled]: disabled }
			)}
		>
			{children}
		</button>
	);
};
