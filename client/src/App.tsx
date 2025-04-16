import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/use-auth";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import SalonPage from "./pages/salon";
import MenuPage from "./pages/menu";
import OrdersPage from "./pages/orders";
import PaymentsPage from "./pages/payments";
import ReportsPage from "./pages/reports";
import InventoryPage from "./pages/inventory";
import StaffPage from "./pages/staff";
import SettingsPage from "./pages/settings";
import HelpPage from "./pages/help";
import NotFoundPage from "./pages/not-found";
import { Route, Switch } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route>
              <MainLayout>
                <Switch>
                  <Route path="/" component={DashboardPage} />
                  <Route path="/salon" component={SalonPage} />
                  <Route path="/menu" component={MenuPage} />
                  <Route path="/orders" component={OrdersPage} />
                  <Route path="/payments" component={PaymentsPage} />
                  <Route path="/reports" component={ReportsPage} />
                  <Route path="/inventory" component={InventoryPage} />
                  <Route path="/staff" component={StaffPage} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/help" component={HelpPage} />
                  <Route component={NotFoundPage} />
                </Switch>
              </MainLayout>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Router({ children }){
    return <>{children}</>
}