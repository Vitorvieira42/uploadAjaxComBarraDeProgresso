
import React, { useState, useEffect } from 'react'
import {Plus, Search, Edit, Trash2, Phone, Mail, Building2, User} from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Cliente {
  _id: string
  nome: string
  tipo: 'pessoa_fisica' | 'pessoa_juridica'
  cpfCnpj: string
  rgInscricaoEstadual?: string
  telefone: string
  telefoneSecundario?: string
  email: string
  endereco?: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    cep: string
    estado: string
  }
  status: string
  segmento?: string
  observacoes?: string
  dataUltimoContato?: string
  valorTotalNegocios: number
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [segmentoFilter, setSegmentoFilter] = useState('')

  const segmentos = [
    'Metalurgia',
    'Comércio Varejista',
    'Consultoria',
    'Supermercado',
    'Indústria',
    'Serviços',
    'Tecnologia',
    'Educação',
    'Saúde',
    'Outros'
  ]

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const data = await lumi.entities.clientes.list()
      setClientes(data)
    } catch (error) {
      toast.error('Erro ao carregar clientes')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      await lumi.entities.clientes.delete(id)
      toast.success('Cliente excluído com sucesso!')
      loadClientes()
    } catch (error) {
      toast.error('Erro ao excluir cliente')
      console.error('Erro:', error)
    }
  }

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.cpfCnpj.includes(searchTerm)
    
    const matchesTipo = !tipoFilter || cliente.tipo === tipoFilter
    const matchesStatus = !statusFilter || cliente.status === statusFilter
    const matchesSegmento = !segmentoFilter || cliente.segmento === segmentoFilter

    return matchesSearch && matchesTipo && matchesStatus && matchesSegmento
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'dd/MM/yyyy')
  }

  const formatDocument = (cpfCnpj: string, tipo: string) => {
    if (tipo === 'pessoa_fisica') {
      return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      return cpfCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      inativo: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inativo' },
      prospecto: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Prospecto' },
      bloqueado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Bloqueado' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'pessoa_fisica' ? 
      <User className="h-4 w-4 text-blue-500" /> : 
      <Building2 className="h-4 w-4 text-purple-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os clientes da empresa
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="pessoa_fisica">Pessoa Física</option>
            <option value="pessoa_juridica">Pessoa Jurídica</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="prospecto">Prospecto</option>
            <option value="bloqueado">Bloqueado</option>
          </select>

          <select
            value={segmentoFilter}
            onChange={(e) => setSegmentoFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os segmentos</option>
            {segmentos.map(segmento => (
              <option key={segmento} value={segmento}>{segmento}</option>
            ))}
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            Total: {filteredClientes.length} clientes
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhum cliente encontrado</div>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo cliente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segmento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Contato
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTipoIcon(cliente.tipo)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {cliente.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cliente.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDocument(cliente.cpfCnpj, cliente.tipo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {cliente.telefone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {cliente.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.segmento || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(cliente.valorTotalNegocios)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(cliente.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(cliente.dataUltimoContato)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Clientes
