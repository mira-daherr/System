import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/Dashboard";
import ForgotPassword from "./pages/login/forgetpassword";
import Products from "./pages/products/Products";
import Categories from "./pages/Categories/Categories";
import ProductsByCategory from "./pages/ProductsByCategory/ProductsByCategory";
import Games from './pages/games/Game';
import Expenses from './pages/Expenses/Expenses';
import CustomerPurchase from './pages/Customers/CustomerPurchase';
import Customers from './pages/Customers/Customers';
import { isAuthenticated } from "./utils/auth";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Categories Routes */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/products/category/:category"
            element={
              <ProtectedRoute>
                <ProductsByCategory />
              </ProtectedRoute>
            }
          />
          
          {/* All Products Route */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          
          {/* Games Route */}
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />
          
          {/* Expenses Route */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />

          {/* Customer Purchase Route */}
          <Route
            path="/customer-purchase"
            element={
              <ProtectedRoute>
                <CustomerPurchase />
              </ProtectedRoute>
            }
          />

          {/* Customers List Route */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;