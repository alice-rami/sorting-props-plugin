import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from './components/Button/Button';

function App(props) {
	const [count, setCount] = useState(0);

	return (
		<>
			<div>
				<a target='_blank' href='https://vitejs.dev'>
					<img alt='Vite logo' className='logo' src={viteLogo} />
				</a>
				<a href='https://react.dev' target='_blank'>
					<img alt='React logo' className='logo react' src={reactLogo} />
				</a>
			</div>
			<h1>Vite + React</h1>
			<Button
				color='primary'
				disabled
				handleClick={() => console.log('hello')}
				size='s'
				onClick={() => console.log('Hello1')}
				key={1}
			>
				Hello
			</Button>
			<Button
				color='secondary'
				disabled={false}
				handleClick={() => console.log('hello')}
				{...props}
				size='l'
				key={2}
				onClick={() => console.log('Hello1')}
			>
				Hello
			</Button>
			<div className='card'>
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className='read-the-docs'>
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

export default App;
