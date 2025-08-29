
import React, { useState, useEffect } from 'react'
import {Plus, Search, Edit, Trash2, Phone, Mail, MapPin} from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Funcionario {
  _id: string
  nome: string
  cpf: string
  rg?: string
  cargo: string
  departamento: string
  salario: number
  dataAdmissao: string
  dataDemissao?: string
  telefone: string
  email: string
  endereco?: {
    rua: string
    numero: string
    bairro: string
    cidade: string
    cep: string
    estado: string
  }
  status: string
  observacoes?: string
}

const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null)

  const departamentos = [
    { value: 'administracao', label: 'Administração' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'recursos_humanos', label: 'Recursos Humanos' },
    { value: 'ti', label: 'Tecnologia da Informação' },
    { value: 'operacional', label: 'Operacional' }
  ]

  useEffect(() => {
    loadFuncionarios()
  }, [])

  const loadFuncionarios = async () => {
    try {
      setLoading(true)
      const data = await lumi.entities.funcionarios.list()
      setFuncionarios(data)
    } catch (error) {
      toast.error('Erro ao carregar funcionários')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return

    try {
      await lumi.entities.funcionarios.delete(id)
      toast.success('Funcionário excluído com sucesso!')
      loadFuncionarios()
    } catch (error) {
      toast.error('Erro ao excluir funcionário')
      console.error('Erro:', error)
    }
  }

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario)
    setShowModal(true)
  }

  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = !departmentFilter || funcionario.departamento === departmentFilter
    const matchesStatus = !statusFilter || funcionario.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy')
  }

  const getDepartmentLabel = (value: string) => {
    const dept = departamentos.find(d => d.value === value)
    return dept?.label || value
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      inativo: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inativo' },
      ferias: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Férias' },
      licenca: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Licença' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os funcionários da empresa
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFuncionario(null)
            setShowModal(true)
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os departamentos</option>
            {departamentos.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="ferias">Férias</option>
            <option value="licenca">Licença</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            Total: {filteredFuncionarios.length} funcionários
          </div>
        </div>
      </div>

      {/* Lista de Funcionários */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filteredFuncionarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhum funcionário encontrado</div>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo funcionário</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo / Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admissão
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFuncionarios.map((funcionario) => (
                  <tr key={funcionario._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {funcionario.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          CPF: {funcionario.cpf}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{funcionario.cargo}</div>
                      <div className="text-sm text-gray-500">
                        {getDepartmentLabel(funcionario.departamento)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {funcionario.telefone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {funcionario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(funcionario.salario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(funcionario.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(funcionario.dataAdmissao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(funcionario)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(funcionario._id)}
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

export default Funcionarios
