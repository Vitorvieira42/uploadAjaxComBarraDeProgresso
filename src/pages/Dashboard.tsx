
import React, { useState, useEffect } from 'react'
import {Users, UserCheck, FolderOpen, FileText, TrendingUp, Calendar, DollarSign, AlertCircle} from 'lucide-react'
import { lumi } from '../lib/lumi'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardStats {
  funcionarios: number
  clientes: number
  projetos: number
  documentos: number
  projetosAtivos: number
  faturamentoMes: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    funcionarios: 0,
    clientes: 0,
    projetos: 0,
    documentos: 0,
    projetosAtivos: 0,
    faturamentoMes: 0
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Buscar estatísticas
        const [funcionariosRes, clientesRes, projetosRes, documentosRes] = await Promise.all([
          lumi.entities.funcionarios.list(),
          lumi.entities.clientes.list(),
          lumi.entities.projetos.list(),
          lumi.entities.documentos.list()
        ])

        const funcionarios = funcionariosRes.list || []
        const clientes = clientesRes.list || []
        const projetos = projetosRes.list || []
        const documentos = documentosRes.list || []

        // Calcular estatísticas
        const projetosAtivos = projetos.filter(p => p.status === 'em_andamento').length
        const faturamentoMes = projetos
          .filter(p => p.status === 'concluido')
          .reduce((total, p) => total + (p.orcamento || 0), 0)

        setStats({
          funcionarios: funcionarios.length,
          clientes: clientes.length,
          projetos: projetos.length,
          documentos: documentos.length,
          projetosAtivos,
          faturamentoMes
        })

        // Projetos recentes
        const projetosRecentes = projetos
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        
        setRecentProjects(projetosRecentes)

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: 'Funcionários',
      value: stats.funcionarios,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Clientes',
      value: stats.clientes,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Projetos',
      value: stats.projetos,
      icon: FolderOpen,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Documentos',
      value: stats.documentos,
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'planejamento':
        return 'bg-yellow-100 text-yellow-800'
      case 'pausado':
        return 'bg-red-100 text-red-800'
      case 'cancelado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluido':
        return 'Concluído'
      case 'planejamento':
        return 'Planejamento'
      case 'pausado':
        return 'Pausado'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo ao Sistema Administrativo
            </h1>
            <p className="text-blue-100 text-lg">
              Empresa Administrativa - Guarulhos, Jardim Santa Cecília
            </p>
            <p className="text-blue-200 text-sm mt-2">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <TrendingUp className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 card-hover cursor-pointer`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Projetos Ativos</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.projetosAtivos}</p>
              <p className="text-sm text-gray-500 mt-1">Em andamento</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Faturamento</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                R$ {stats.faturamentoMes.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-gray-500 mt-1">Projetos concluídos</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Este Mês</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {format(new Date(), 'MMM', { locale: ptBR }).toUpperCase()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(), 'yyyy', { locale: ptBR })}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Projetos Recentes</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todos
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((projeto) => (
              <div key={projeto._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{projeto.nome}</h4>
                  <p className="text-sm text-gray-500 mt-1">{projeto.descricao}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(projeto.status)}`}>
                      {getStatusText(projeto.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Orçamento: R$ {projeto.orcamento?.toLocaleString('pt-BR') || '0'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(projeto.createdAt), 'dd/MM/yyyy')}
                  </p>
                  {projeto.percentualConcluido !== undefined && (
                    <div className="mt-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${projeto.percentualConcluido}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{projeto.percentualConcluido}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
