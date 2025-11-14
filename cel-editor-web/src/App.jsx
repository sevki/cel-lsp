import CelEditor from './CelEditor';
import './App.css';

function App() {
  // Get LSP endpoint from environment variable or use default
  const lspEndpoint = import.meta.env.VITE_LSP_ENDPOINT || 'http://localhost:8787/lsp';

  return (
    <div className="App">
      <CelEditor lspEndpoint={lspEndpoint} />
    </div>
  );
}

export default App;
