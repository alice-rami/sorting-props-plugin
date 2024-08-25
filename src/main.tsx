import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import './index.css';

const props = { prop1: 'one', prop2: 'two' };

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App {...props} />
	</StrictMode>
);
