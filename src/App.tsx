
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Funcionarios from './pages/Funcionarios'
import Clientes from './pages/Clientes'
import Projetos from './pages/Projetos'
import Documentos from './pages/Documentos'

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          },
          success: {
            style: {
              border: '1px solid #10b981',
              color: '#065f46'
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            style: {
              border: '1px solid #ef4444',
              color: '#991b1b'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
      
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/documentos" element={<Documentos />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
