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
import Variants from './components/products/Variants'
import VariantForm from './components/products/VariantForm'
import Stocks from './components/inventory/Stocks'
import StockForm from './components/inventory/StockForm'
import Warehouses from './components/inventory/Warehouses'
import WarehouseForm from './components/inventory/WarehouseForm'
import StockMovements from './components/inventory/StockMovements'
import Fournisseurs from './components/purchases/Fournisseurs'
import PurchaseOrders from './components/purchases/PurchaseOrders'
import PurchaseOrderForm from './components/purchases/PurchaseOrderForm'
import FournisseurForm from './components/purchases/FournisseurForm'
import PurchaseReceipts from './components/purchases/PurchaseReceipts'
import PurchaseReceiptForm from './components/purchases/PurchaseReceiptForm'
import PurchaseReceiptDetails from './components/purchases/PurchaseReceiptDetails'
import PurchaseReceiptPDF from './components/purchases/PurchaseReceiptPDF'
import Users from './components/users/Users'
import UserForm from './components/users/UserForm'
import Roles from './components/users/Roles'
import Customers from './components/sales/Customers'
import CustomerForm from './components/sales/CustomerForm'
import CustomerDetails from './components/sales/CustomerDetails'
import Sales from './components/sales/Sales'
import SaleForm from './components/sales/SaleForm'
import Invoices from './components/sales/Invoices'
import InvoiceForm from './components/sales/InvoiceForm'
import InvoiceDetails from './components/sales/InvoiceDetails'
import Payments from './components/sales/Payments'
import PaymentForm from './components/sales/PaymentForm'
import PointOfSale from './components/sales/PointOfSale'

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

                        {/* Variantes (si page dédiée)  */}
                        <Route path="/variants" element={<Variants />} />
                        <Route path="/variants/nouveau" element={<VariantForm />} />
                        <Route path="/variants/:id/modifier" element={<VariantForm />} />
                        {/* Stocks (si page dédiée)  */}
                        <Route path="/stocks" element={<Stocks />} />
                        <Route path="/stocks/nouveau" element={<StockForm />} />
                        <Route path="/stocks/:id/modifier" element={<StockForm />} />

                         {/* Entrepots (si page dédiée)  */}
                         <Route path="/entrepots" element={<Warehouses />} />
                         <Route path="/entrepots/nouveau" element={<WarehouseForm />} />
                         <Route path="/entrepots/:id/modifier" element={<WarehouseForm />} />

                        <Route path="/mouvements-stock" element={<StockMovements />} />

                           {/* Fournisseurs (si page dédiée)  */}
                         <Route path="/fournisseurs" element={<Fournisseurs />} />
                         <Route path="/fournisseurs/nouveau" element={<FournisseurForm />} />
                         <Route path="/fournisseurs/:id/modifier" element={<FournisseurForm />} />

                                         
                           {/* COMMADES (si page dédiée)  */}
                         <Route path="/commandes-fournisseurs" element={<PurchaseOrders />} />
                         <Route path="/commandes/nouveau" element={<PurchaseOrderForm />} />
                         <Route path="/commandes/:id/modifier" element={<PurchaseOrderForm />} />

                         {/* recaptio (si page dédiée)  */}
                         <Route path="/receptions" element={<PurchaseReceipts />} />
                         <Route path="/receptions/nouveau" element={<PurchaseReceiptForm />} />
                         <Route path="/receptions/:id/modifier" element={<PurchaseReceiptForm />} />
                          <Route path="/receptions/:id" element={<PurchaseReceiptDetails />} />
                          <Route path="/receptions/:id/pdf" element={<PurchaseReceiptPDF />} />




                        {/* Gestion des clients */}
                        <Route path="/clients" element={<Customers />} />
                        <Route path="/clients/nouveau" element={<CustomerForm />} />
                        <Route path="/clients/:id" element={<CustomerDetails />} />
                        <Route path="/clients/:id/modifier" element={<CustomerForm />} />

                        {/* Profil utilisateur */}
                        
                        <Route path="/utilisateurs" element={<Users />} />
                        <Route path="/utilisateurs/nouveau" element={<UserForm />} />
                        <Route path="/utilisateurs/:id/modifier" element={<UserForm />} />
                         <Route path="/roles" element={<Roles />} />


                           {/* GESTIOn VETES utilisateur */}
                         <Route path="/ventes" element={<Sales />} />
                         <Route path="/ventes/nouveau" element={<SaleForm />} />
                         <Route path="/ventes/:id/modifier" element={<SaleForm />} />


                             {/* GESTIOn VETES FACTURES */}
                         <Route path="/factures" element={<Invoices />} />
                          <Route path="/factures/nouveau" element={<InvoiceForm />} />
                         <Route path="/factures/:id" element={<InvoiceDetails />} /> 


                                         
                          <Route path="/paiements" element={<Payments />} />
                            <Route path="/paiements/nouveau" element={<PaymentForm />} />



                                  {/* GESTIOn VETES FACTURES */}
                              <Route path="/point-de-vente" element={<PointOfSale />} />


            </Route>
          </Routes>
        }
        />
    }
    </>
  )
}

export default App