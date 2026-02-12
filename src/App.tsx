import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalHeader from './components/GlobalHeader';
import Home from './pages/Home';
import CampaignCreationPage from './pages/CampaignCreationPage'; // 추가
import CampaignSegmentResultPage from './pages/CampaignSegmentResultPage';
import MessageResultPage from './pages/MessageResultPage';
import MessageEditPage from './pages/MessageEditPage';
import CampaignListPage from './pages/CampaignListPage';

function App() {
  return (
    <Router>
      <GlobalHeader />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/promotion/create" element={<CampaignCreationPage />} />

          <Route
            path="/campaign/:campaignId/segments"
            element={<CampaignSegmentResultPage />}
          />

          <Route
            path="/campaign/:campaignId"
            element={<MessageResultPage />}
          />

          <Route
            path="/campaigns"
            element={<CampaignListPage />}
          />

          <Route
            path="/campaign/:campaignId/messages/:resultId/edit"
            element={<MessageEditPage />}
          />
        </Routes>
      </main>
    </Router>
  );
}


export default App;
