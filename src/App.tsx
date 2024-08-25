import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from './components/Button/Button';

type AppProps = {
	prop1: string;
	prop2: string;
	prop3?: () => void;
};

function App(props: AppProps) {
	const [count, setCount] = useState(0);

	return (
		<>
			<div>
				<a href='https://vitejs.dev' target='_blank'>
					<img alt='Vite logo' src={viteLogo} className='logo' />
				</a>
				<a href='https://react.dev' target='_blank'>
					<img alt='React logo' src={reactLogo} className='logo react' />
				</a>
			</div>
			<h1>Vite + React</h1>
			<Button
				disabled
				onClick={() => console.log('click')}
				onFocus={() => console.log('focus')}
				onSubmit={() => console.log('submit')}
				handleClick={() => console.log('hello')}
				key={1}
				size='s'
				color='primary'
			>
				Hello
			</Button>
			<Button
				key={2}
				color='secondary'
				className={'button'}
				{...props}
				disabled
				onClick={() => console.log('click')}
				onSubmit={() => console.log('submit')}
				handleClick={() => console.log('hello')}
				aria-label={'some-label'}
				data-test-id={'button'}
				size='l'
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
