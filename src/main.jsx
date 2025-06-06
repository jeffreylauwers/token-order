import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'

const appRoot = document.getElementById('root');
const root = createRoot(appRoot);

root.render(<App/>);
