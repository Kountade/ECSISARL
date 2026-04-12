import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import Navbar from './components/Navbar'
import About from './components/About'
import Products from './components/products/Products'
import ProductForm from './components/products/ProductForm'
import ProductDetails from './components/products/ProductDetails'
import Categories from './components/products/Categories'   
import CategoryForm from './components/products/CategoryForm'
import Brands from './components/products/Brands'
import BrandForm from './components/products/BrandForm'
import Units from './components/products/Units'
import UnitForm from './components/products/UnitForm'


import { Routes, Route , useLocation} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'



function App() {
 
  const location = useLocation()
  // Correction : inverser la condition
  const noNavBar = location.pathname === "/" || location.pathname === "/register" || location.pathname.includes("password")
  
  return (
    <>
    {
      noNavBar ?
      // Pas de Navbar pour login et register
      <Routes>
          <Route path="/register" element={<Register />} />
         <Route path="/" element={<Login />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest/>}/>
          <Route path="/password-reset/:token" element={<PasswordReset/>}/>
      </Routes>
      :
      // Avec Navbar pour les autres routes
      <Navbar 
        content={
      <Routes>
            <Route element={<ProtectedRoute/>}> 
                <Route path="/home" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>


                            {/* Gestion des produits */}
                        <Route path="/produits" element={<Products />} />
                        <Route path="/produits/nouveau" element={<ProductForm />} />
                        <Route path="/produits/:id" element={<ProductDetails />} />
                        <Route path="/produits/:id/modifier" element={<ProductForm />} />

                        {/* Catégories */}
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/categories/nouveau" element={<CategoryForm />} />
                        <Route path="/categories/:id/modifier" element={<CategoryForm />} />

                        {/* Marques */}
                        <Route path="/brands" element={<Brands />} />
                        <Route path="/brands/nouveau" element={<BrandForm />} />
                        <Route path="/brands/:id/modifier" element={<BrandForm />} /> 

                        {/* Unités  */}
                        <Route path="/units" element={<Units />} />
                        <Route path="/units/nouveau" element={<UnitForm />} />
                        <Route path="/units/:id/modifier" element={<UnitForm />} />

                        {/* Variantes (si page dédiée) 
                        <Route path="/variants" element={<Variants />} />
*/}
                        {/* Gestion des clients 
                        <Route path="/clients" element={<Customers />} />
                        <Route path="/clients/nouveau" element={<CustomerForm />} />
                        <Route path="/clients/:id" element={<CustomerDetails />} />
                        <Route path="/clients/:id/modifier" element={<CustomerForm />} />
*/}
                        {/* Profil utilisateur 
                        <Route path="/profile" element={<Profile />} />*/}
            </Route>
          </Routes>
        }
        />
    }
    </>
  )
}

export default App