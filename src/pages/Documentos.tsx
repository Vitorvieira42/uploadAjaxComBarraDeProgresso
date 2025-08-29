
import React, { useState, useEffect } from 'react'
import {Plus, Search, Edit, Trash2, Download, FileText, Shield, Tag} from 'lucide-react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Documento {
  _id: string
  nome: string
  descricao: string
  categoria: string
  tipo: string
  tamanho: number
  url: string
  versao: string
  status: string
  clienteId?: string
  projetoId?: string
  uploadedBy: string
  tags: string[]
  confidencial: boolean
  dataVencimento?: string
}

const Documentos: React.FC = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const categorias = [
    'contrato',
    'proposta',
    'relatorio',
    'certificado',
    'rh',
    'financeiro',
    'juridico',
    'tecnico',
    'outros'
  ]

  const tipos = [
    'pdf',
    'doc',
    'docx',
    'xlsx',
    'xls',
    'ppt',
    'pptx',
    'txt',
    'jpg',
    'png',
    'outros'
  ]

  useEffect(() => {
    loadDocumentos()
  }, [])

  const loadDocumentos = async () => {
    try {
      setLoading(true)
      const data = await lumi.entities.documentos.list()
      setDocumentos(data)
    } catch (error) {
      toast.error('Erro ao carregar documentos')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    try {
      await lumi.entities.documentos.delete(id)
      toast.success('Documento excluído com sucesso!')
      loadDocumentos()
    } catch (error) {
      toast.error('Erro ao excluir documento')
      console.error('Erro:', error)
    }
  }

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategoria = !categoriaFilter || documento.categoria === categoriaFilter
    const matchesTipo = !tipoFilter || documento.tipo === tipoFilter
    const matchesStatus = !statusFilter || documento.status === statusFilter

    return matchesSearch && matchesCategoria && matchesTipo && matchesStatus
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'dd/MM/yyyy')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      arquivado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Arquivado' },
      vencido: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' },
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      contrato: 'Contrato',
      proposta: 'Proposta',
      relatorio: 'Relatório',
      certificado: 'Certificado',
      rh: 'Recursos Humanos',
      financeiro: 'Financeiro',
      juridico: 'Jurídico',
      tecnico: 'Técnico',
      outros: 'Outros'
    }
    return labels[categoria] || categoria
  }

  const getFileIcon = (tipo: string) => {
    const iconClass = "h-5 w-5"
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-500`} />
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-500`} />
      case 'ppt':
      case 'pptx':
        return <FileText className={`${iconClass} text-orange-500`} />
      default:
        return <FileText className={`${iconClass} text-gray-500`} />
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os documentos da empresa
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{getCategoriaLabel(categoria)}</option>
            ))}
          </select>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="arquivado">Arquivado</option>
            <option value="vencido">Vencido</option>
            <option value="pendente">Pendente</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            Total: {filteredDocumentos.length} documentos
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filteredDocumentos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhum documento encontrado</div>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo documento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo / Tamanho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocumentos.map((documento) => (
                  <tr key={documento._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getFileIcon(documento.tipo)}
                        <div className="ml-3">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {documento.nome}
                            </div>
                            {documento.confidencial && (
                              <Shield className="h-4 w-4 ml-2 text-red-500" title="Confidencial" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {documento.descricao}
                          </div>
                          <div className="text-xs text-gray-400">
                            v{documento.versao}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoriaLabel(documento.categoria)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {documento.tipo.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(documento.tamanho)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(documento.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {documento.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {documento.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{documento.tags.length - 3} mais
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(documento.dataVencimento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(documento._id)}
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

export default Documentos
