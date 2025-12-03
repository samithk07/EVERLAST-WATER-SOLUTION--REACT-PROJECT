
import './App.css'
import Registration from './Authentication/Registration'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Signup from './Authentication/Signup'
import Home from './Pages/Home'
import WaterTest from './Pages/WaterTest'
import Services from './Pages/Services'
import About from './Pages/About'
import UserPage from './Pages/UserPage'
import CartPage from './Pages/CartPage'
import ProductsPage from './Pages/Products'
import { Contact } from 'lucide-react'
import CheckoutPage from './Pages/CheckOutPage'





function App() {
  
  return (
    <>
  <BrowserRouter>
  <Routes>
    <Route path='/home'element={<Home/>}></Route>
    <Route path='/'element={<Home/>}></Route>
    <Route path='/login'element={<Signup/>}></Route>
    <Route path='/signup'element={<Registration/>}></Route>
    <Route path='/watertest'element={<WaterTest/>}> </Route>
    <Route path='/services'element={<Services/>}> </Route>
    <Route path='/about'element={<About/>}> </Route>
    <Route path='/userpage'element={<UserPage/>}> </Route>
    <Route path='/cart'element={<CartPage/>}> </Route>
    <Route path='/contact'element={<Contact/>}> </Route>
    <Route path='/products'element={<ProductsPage/>}> </Route>
    <Route path='/watertest'element={<WaterTest/>}> </Route>
    <Route path='/checkout'element={<CheckoutPage/>}> </Route>

  </Routes>
  </BrowserRouter>
   
    
    
   
   
      
    
    </>
  )
}

export default App
