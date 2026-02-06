import { ScriptureProvider } from './context/ScriptureContext.tsx';
import DynamicLayout from './components/layout/DynamicLayout.tsx';

function App() {
  return (
    <ScriptureProvider>
      <DynamicLayout />
    </ScriptureProvider>
  );
}

export default App;
