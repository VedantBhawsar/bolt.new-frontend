import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
