import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormEditor from './pages/FormEditor';
import FormPreview from './pages/FormPreview';
import FormResponses from './pages/FormResponses';
import FillForm from './pages/FillForm';
import ViewResponses from './pages/ViewResponses';
import Navbar from './components/common/Navbar';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                    <Route path="/" element={<FormEditor />} />
                    <Route path="/fill" element={<FillForm />} />
                    <Route path="/responses" element={<ViewResponses />} />
                    <Route path="/preview/:formId" element={<FormPreview />} />
                    <Route path="/responses/:formId" element={<FormResponses />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
