import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CloudProvider } from "./context/CloudContext";
import { ToastProvider } from "./context/ToastContext";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CloudProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CloudProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
