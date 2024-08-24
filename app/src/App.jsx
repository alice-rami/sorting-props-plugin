import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from './components/Button/Button';

function App(props) {
	const [count, setCount] = useState(0);

	return (
		<>
			<Button
				active
				handleClick={() => console.log('hello')}
				color='primary'
				{...props}
				disabled
				key={1}
				size='s'
				onClick={() => console.log('Hello1')}
			>
				Hello
			</Button>
			<Button
				disabled
				key={1}
				size='l'
				onClick={() => console.log('Hello1')}
				handleClick={() => console.log('hello')}
				color='secondary'
			>
				Hello
			</Button>
		</>
	);
}

export default App;
