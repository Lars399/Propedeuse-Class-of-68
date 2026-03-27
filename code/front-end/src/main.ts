import './style.css';
import { startApp } from './app';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app root element');

startApp(root);

