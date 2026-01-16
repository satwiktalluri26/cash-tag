import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import ConnectSheet from "./pages/ConnectSheet";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import Caches from "./pages/Caches";
import Trends from "./pages/Trends";
import Settings from "./pages/Settings";
import InitializeSheet from "./pages/InitializeSheet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/connect" element={<ConnectSheet />} />
            <Route path="/initialize" element={<InitializeSheet />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/caches" element={<Caches />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
