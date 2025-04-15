import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";

// Lazy load components for better performance
const BookingCalendar = lazy(() => import("./components/BookingCalendar"));
const AIRecommendation = lazy(() => import("./components/AIRecommendation"));
const ChatbotInterface = lazy(() => import("./components/ChatbotInterface"));
const StylistBrowser = lazy(() => import("./components/StylistBrowser"));
const Login = lazy(() => import("./components/Login"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const ServicesPage = lazy(() => import("./components/ServicesPage"));

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<BookingCalendar />} />
          <Route path="/ai-recommendation" element={<AIRecommendation />} />
          <Route path="/chatbot" element={<ChatbotInterface />} />
          <Route path="/stylists" element={<StylistBrowser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
