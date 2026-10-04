/** Main application component managing screen transitions. */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DemoScenario } from './components/ScenarioChips';
import { DescribeScreen } from './features/DescribeScreen';
import { LandingScreen } from './features/LandingScreen';
import { ReexamineScreen } from './features/ReexamineScreen';
import { ScanningScreen } from './features/ScanningScreen';
import { SummaryScreen } from './features/SummaryScreen';
import { XrayResultScreen } from './features/XrayResultScreen';
import { useScotomaStore } from './store/useScotomaStore';

export const App: React.FC = () => {
  const { currentScreen, setScreen } = useScotomaStore();
  const [activeScenario, setActiveScenario] = useState<DemoScenario | undefined>(undefined);

  const handleStartWithScenario = (sc?: DemoScenario) => {
    setActiveScenario(sc);
    setScreen('describe');
  };

  return (
    <div>
      <Navbar />
      <main>
        {currentScreen === 'landing' && (
          <LandingScreen onStartWithScenario={handleStartWithScenario} />
        )}
        {currentScreen === 'describe' && (
          <DescribeScreen
            initialTitle={activeScenario?.title}
            initialOptions={activeScenario?.options}
            initialReasoning={activeScenario?.reasoning}
            initialContext={activeScenario?.context}
          />
        )}
        {currentScreen === 'scanning' && <ScanningScreen />}
        {currentScreen === 'result' && <XrayResultScreen />}
        {currentScreen === 'summary' && <SummaryScreen />}
      </main>
    </div>
  );
};

export default App;
