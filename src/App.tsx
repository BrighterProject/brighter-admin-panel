import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRouter } from "@/components/router/app-router";
import { useEffect } from "react";
import { initGTM } from "@/utils/analytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const basename = import.meta.env.VITE_BASENAME || "";

function App() {
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="brighter-theme">
      <QueryClientProvider client={queryClient}>
        <Router basename={basename}>
          <AppRouter />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
