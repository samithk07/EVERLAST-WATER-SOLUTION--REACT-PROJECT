import './App.css'
import Registration from './Authentication/Registration'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Authentication/Signup'
import Home from './pages/Home'
import WaterTest from './pages/WaterTest'
import Services from './pages/Services'
import About from './pages/About'
import UserPage from './pages/UserPage'
import CartPage from './pages/CartPage'
import ProductsPage from './pages/ProductsPage'
import CheckoutPage from './pages/CheckOutPage'
import { AuthProvider } from './context/AuthContext'
import adminProtectedRoute from './admin/ProtectedRoute'
// admin Components
import adminLayout from './admin/Layout/adminLayout'
import DashboardPage from './admin/Dashboard'
import ProductsPageadmin from './admin/Products'
import OrdersPage from './admin/Orders'
import UsersPage from './admin/Users'
import ServicesPage from './admin/ServicesPage'
import NotFoundPage from './component/NotFoundPage'
// User Orders Module
import UserOrdersPage from './comp/orders/UserOrdersPage'
import OrderDetailsPage from './comp/orders/OrderDetailsPage'


function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
                

          <Routes>
            {/* Public Routes */}
            <Route path='/home' element={<Home/>} />
            <Route path='/' element={<Home/>} />
            <Route path='/login' element={<Signup/>} />
            <Route path='/signup' element={<Registration/>} />
            <Route path='/watertest' element={<WaterTest/>} />
            <Route path='/services' element={<Services/>} />
            <Route path='/about' element={<About/>} />
            <Route path='/products' element={<ProductsPage/>} />
            <Route path='/checkout' element={<CheckoutPage/>} />
            <Route path='/orders' element={<OrderDetailsPage/>} />
            <Route path='/orders' element={<UserOrdersPage/>} />
                    <Route path="*" element={<NotFoundPage />} />

            
            {/* Protected User Routes */}
            <Route path='/userpage' element={<UserPage/>} />
            <Route path='/cart' element={<CartPage/>} />
            
            {/* admin Routes with Layout */}
            <Route path='/admin' element={
              <adminProtectedRoute>
                <adminLayout />
              </adminProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path='dashboard' element={<DashboardPage />} />
              <Route path='products' element={<ProductsPageadmin />} />
              <Route path='orders' element={<OrdersPage />} />
              <Route path='users' element={<UsersPage />} />
              <Route path='services' element={<ServicesPage />} />
            </Route>
            
            
            <Route path='*' element={<Navigate to="/" replace />} />
          </Routes>

        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App