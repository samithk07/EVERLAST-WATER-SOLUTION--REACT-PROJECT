import './App.css'
import Registration from './Authentication/Registration'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Authentication/Signup'
import Home from './Pages/Home'
import WaterTest from './Pages/WaterTest'
import Services from './Pages/Services'
import About from './Pages/About'
import UserPage from './Pages/UserPage'
import CartPage from './Pages/CartPage'
import ProductsPage from './Pages/Products'
import CheckoutPage from './Pages/CheckOutPage'
import { AuthProvider } from './context/AuthContext'
import AdminProtectedRoute from './Admin/ProtectedRoute'
// Admin Components
import AdminLayout from './Admin/Layout/AdminLayout'
import DashboardPage from './Admin/Dashboard'
import ProductsPageAdmin from './Admin/Products'
import OrdersPage from './Admin/Orders'
import UsersPage from './Admin/Users'
import ServicesPage from './Admin/ServicesPage'
import NotFoundPage from './Component/NotFoundPage'
// User Orders Module
import UserOrdersPage from './components/orders/UserOrdersPage'
import OrderDetailsPage from './components/orders/OrderDetailsPage'


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
            
            {/* Admin Routes with Layout */}
            <Route path='/admin' element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path='dashboard' element={<DashboardPage />} />
              <Route path='products' element={<ProductsPageAdmin />} />
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