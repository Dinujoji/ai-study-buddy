import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Quiz from "@/pages/Quiz";
import Chat from "@/pages/Chat";
import Notes from "@/pages/Notes";
import Recommendations from "@/pages/Recommendations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/quiz"
            element={
              <AppLayout>
                <Quiz />
              </AppLayout>
            }
          />
          <Route
            path="/chat"
            element={
              <AppLayout>
                <Chat />
              </AppLayout>
            }
          />
          <Route
            path="/notes"
            element={
              <AppLayout>
                <Notes />
              </AppLayout>
            }
          />
          <Route
            path="/recommendations"
            element={
              <AppLayout>
                <Recommendations />
              </AppLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
