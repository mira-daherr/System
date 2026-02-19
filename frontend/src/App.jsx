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
import Reports from './pages/Report/Report'; // ← added
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
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/products/category/:category" element={<ProtectedRoute><ProductsByCategory /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/customer-purchase" element={<ProtectedRoute><CustomerPurchase /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} /> {/* ← added */}

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
