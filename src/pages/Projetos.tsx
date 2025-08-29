
import React, { useState, useEffect } from 'react'
import {Plus, Search, Edit, Trash2, Calendar, DollarSign, Users, BarChart3} from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Projeto {
  _id: string
  nome: string
  descricao: string
  clienteId?: string
  responsavelId?: string
  equipe: string[]
  status: string
  prioridade: string
  dataInicio: string
  dataFimPrevista: string
  dataFimReal?: string
  orcamento: number
  valorGasto: number
  percentualConcluido: number
  observacoes?: string
}

const Projetos: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [prioridadeFilter, setPrioridadeFilter] = useState('')

  useEffect(() => {
    loadProjetos()
  }, [])

  const loadProjetos = async () => {
    try {
      setLoading(true)
      const data = await lumi.entities.projetos.list()
      setProjetos(data)
    } catch (error) {
      toast.error('Erro ao carregar projetos')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return

    try {
      await lumi.entities.projetos.delete(id)
      toast.success('Projeto excluído com sucesso!')
      loadProjetos()
    } catch (error) {
      toast.error('Erro ao excluir projeto')
      console.error('Erro:', error)
    }
  }

  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || projeto.status === statusFilter
    const matchesPrioridade = !prioridadeFilter || projeto.prioridade === prioridadeFilter

    return matchesSearch && matchesStatus && matchesPrioridade
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planejamento: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Planejamento' },
      em_andamento: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Em Andamento' },
      pausado: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pausado' },
      concluido: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluído' },
      cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planejamento
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      baixa: { bg: 'bg-green-100', text: 'text-green-800', label: 'Baixa' },
      media: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Média' },
      alta: { bg: 'bg-red-100', text: 'text-red-800', label: 'Alta' },
      critica: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Crítica' }
    }
    
    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.media
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getProgressColor = (percentual: number) => {
    if (percentual >= 80) return 'bg-green-500'
    if (percentual >= 50) return 'bg-blue-500'
    if (percentual >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
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
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os projetos da empresa
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="planejamento">Planejamento</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={prioridadeFilter}
            onChange={(e) => setPrioridadeFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todas as prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            Total: {filteredProjetos.length} projetos
          </div>
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filteredProjetos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhum projeto encontrado</div>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo projeto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projeto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status / Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orçamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipe
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjetos.map((projeto) => (
                  <tr key={projeto._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {projeto.nome}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {projeto.descricao}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(projeto.status)}
                        {getPrioridadeBadge(projeto.prioridade)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-900">{projeto.percentualConcluido}%</span>
                            <BarChart3 className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(projeto.percentualConcluido)}`}
                              style={{ width: `${projeto.percentualConcluido}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(projeto.orcamento)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Gasto: {formatCurrency(projeto.valorGasto)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(projeto.dataFimPrevista)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Início: {formatDate(projeto.dataInicio)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {projeto.equipe.length} pessoas
                      </div>
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
                          onClick={() => handleDelete(projeto._id)}
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

export default Projetos
