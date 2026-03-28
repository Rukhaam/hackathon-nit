import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "./redux/slices/authSlice";
import { checkAuthAPI } from "./api/authApi";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoutes";
import MainLayout from "./components/layout/mainLayout";

// Public Pages
import Home from "./pages/public/homePage";
import Login from "./pages/public/loginPage";
import Register from "./pages/public/registerPage";
import ExplorePage from "./pages/public/explorePage";
import AreaSearchPage from "./pages/public/areaSearchPage";
import ServiceProviders from "./pages/public/serviceProvidersPage";
import ForgotPassword from "./pages/public/forgetPassword";

// Customer Pages
import CustomerDashboard from "./pages/customer/customerDashboard";
import MyBookings from "./pages/customer/myBookings";
import ProviderProfile from "./pages/customer/providerProfile";

// Provider Pages
import ProviderDashboard from "./pages/provider/providerDashBoard";
import ManageJobs from "./pages/provider/manageJobs";
import EditProfile from "./pages/provider/editProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/adminDashBoard";
import ApproveProviders from "./pages/admin/approveProviders";
import ManageCategories from "./pages/admin/managerCategories";

import ScrollToTop from "./hooks/scrollToTopHook";
import { Toaster, toast } from "react-hot-toast";


function App() {
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let retryCount = 0;
    let pollInterval;

    const verifySession = async () => {
      try {
        const response = await checkAuthAPI();
        dispatch(setCredentials(response.user));
        setIsCheckingAuth(false);

        if (retryCount > 0) {
          toast.success("Server is online! Refreshing data...", {
            id: "server-wake",
          });
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        if (!error.response || error.response.status >= 500) {
          retryCount++;

          if (retryCount > 15) {
            toast.error("Server seems to be offline right now.", {
              id: "server-wake",
            });
            setIsCheckingAuth(false);
            return;
          }

          if (retryCount === 1) {
            toast.loading(
              "Waking up secure server. This may take up to 50 seconds...",
              { id: "server-wake" }
            );
          }

          console.log(
            `Backend sleeping. Retrying in 5 seconds... (Attempt ${retryCount})`
          );
          pollInterval = setTimeout(verifySession, 5000);
        } else {
          dispatch(logout());
          setIsCheckingAuth(false);

          if (retryCount > 0) {
            toast.success("Server is online! Refreshing data...", {
              id: "server-wake",
            });
            setTimeout(() => window.location.reload(), 1000);
          }
        }
      }
    };

    verifySession();

    // Cleanup interval if the component unmounts
    return () => clearTimeout(pollInterval);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop></ScrollToTop>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: "shadow-lg rounded-xl text-sm font-medium",
          duration: 4000,
        }}
      />

      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<AreaSearchPage />} />
          <Route path="/providers" element={<ServiceProviders />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Customer Routes */}
          <Route path="/customer/provider/:id" element={<ProviderProfile />} />

          {/* 🔒 Protected Customer Routes */}
          <Route
            element={
              <ProtectedRoute
                isCheckingAuth={isCheckingAuth}
                allowedRoles={["customer"]}
              />
            }
          >
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/bookings" element={<MyBookings />} />
          </Route>

          {/* 🔒 Protected Provider Routes */}
          <Route
            element={
              <ProtectedRoute
                isCheckingAuth={isCheckingAuth}
                allowedRoles={["provider"]}
              />
            }
          >
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/jobs" element={<ManageJobs />} />
            <Route path="/provider/profile" element={<EditProfile />} />
          </Route>

          {/* 🔒 Protected Admin Routes */}
          <Route
            element={
              <ProtectedRoute
                isCheckingAuth={isCheckingAuth}
                allowedRoles={["admin"]}
              />
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/approve-providers"
              element={<ApproveProviders />}
            />
            <Route path="/admin/categories" element={<ManageCategories />} />
          </Route>

          {/* Catch-All */}
          <Route
            path="*"
            element={
              <div className="p-8 text-2xl font-bold text-center mt-20">
                404 - Page Not Found
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
