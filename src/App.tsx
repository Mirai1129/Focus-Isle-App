
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {FocusProvider} from './context/FocusContext';
import Welcome from './components/Welcome';
import LoginRegister from './components/LoginRegister';
import FocusTopic from './components/FocusTopic';
import PlantSelection from './components/PlantSelection';
import WhitelistManager from './components/WhitelistManager';
import Dashboard from './components/Dashboard';
import FocusTimer from './components/FocusTimer';
import FocusSuccess from './components/FocusSuccess';
import FocusFailed from './components/FocusFailed';
import History from './components/History';
import Analytics from './components/Analytics';
import PlantCollection from './components/PlantCollection';
import Settings from './components/Settings';
import DebugAuth from './components/DebugAuth';

export default function App() {
    return (
        <Router>
            <FocusProvider>
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<Welcome/>}/>
                        <Route path="/auth" element={<LoginRegister/>}/>
                        <Route path="/topic" element={<FocusTopic/>}/>
                        <Route path="/plant-selection" element={<PlantSelection/>}/>
                        <Route path="/whitelist" element={<WhitelistManager/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/focus" element={<FocusTimer/>}/>
                        <Route path="/success" element={<FocusSuccess/>}/>
                        <Route path="/failed" element={<FocusFailed/>}/>
                        <Route path="/history" element={<History/>}/>
                        <Route path="/analytics" element={<Analytics/>}/>
                        <Route path="/collection" element={<PlantCollection/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                        <Route path="/debug" element={<DebugAuth/>}/>
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </div>
            </FocusProvider>
        </Router>
    );
}