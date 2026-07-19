import './app.css';
import App from './App.svelte';
import { fetchRepos } from './utils/github';

// warm the ~/projects directory so ls/cat work before `projects` is run
void fetchRepos();

const app = new App({
  target: document.getElementById('app')!
});

export default app;
