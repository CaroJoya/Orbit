/*
 * Atlas Editorial reminder for the app shell:
 * Keep the product visual, not generic. The shell routes to the visual demo
 * and its companion workspace pages; there is deliberately no backend behavior.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AccountPage, ActivityPage, ExplorePage, GuidePage, TripsPage } from "./pages/ProductPages";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/trips" component={TripsPage} />
    <Route path="/explore" component={ExplorePage} />
    <Route path="/guide" component={GuidePage} />
    <Route path="/activity" component={ActivityPage} />
    <Route path="/account" component={AccountPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
