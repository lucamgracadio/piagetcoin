'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coins, Users, Send, LogOut, Wallet, Copy, CheckCircle,
  Loader2, ExternalLink, Search, RefreshCw, X, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress, formatPGT } from '@/lib/web3/metamask'
import type { Profile, Wallet as WalletType, Transaction } from '@/types'
import { useRouter } from 'next/navigation'

interface StudentWithWallet extends Profile {
  wallet: WalletType | null
}

// ─── Modal de Envio ──────────────────────────────────────────

function SendModal({
  student,
  senderUserId,
  onClose,
  onSuccess,
}: {
  student: StudentWithWallet
  senderUserId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const { send, isSending, isConnected, connect, hasMetaMask, formattedAddress } = useWallet(senderUserId)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleSend = async () => {
    if (!student.wallet?.address) {
      toast.error('Este aluno ainda não conectou a carteira MetaMask')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Informe uma quantidade válida de PGT')
      return
    }
    if (!isConnected) {
      toast.error('Conecte sua MetaMask primeiro')
      return
    }

    try {
      const result = await send({
        toAddress: student.wallet.address,
        amount,
        studentName: student.full_name,
        reason,
      })

      const supabase = createClient()
      await supabase.from('transactions').insert({
        from_user_id: senderUserId,
        to_user_id: student.id,
        amount: parseFloat(amount),
        reason: reason || 'Recompensa PiagetCoin',
        tx_hash: result.hash,
        status: 'pending',
      })

      setTxHash(result.hash)
      toast.success(`${amount} PGT enviados para ${student.full_name}!`)
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar PGT')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass rounded-2xl border border-border p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-piaget-gradient flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Enviar PGT</h2>
              <p className="text-xs text-muted-foreground">Piagetcoin · Sepolia</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 mb-5 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Destinatário</div>
          <div className="font-semibold">{student.full_name}</div>
          {student.wallet ? (
            <div className="text-xs text-piaget-400 font-mono mt-1 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              {formatAddress(student.wallet.address)}
              <a
                href={`https://sepolia.etherscan.io/address/${student.wallet.address}`}
                target="_blank" rel="noopener noreferrer"
                className="ml-1 hover:text-piaget-300"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
              <AlertCircle className="w-3 h-3" />
              Aluno não conectou a carteira ainda
            </div>
          )}
        </div>

        {!isConnected && (
          <div className="mb-5">
            <button
              onClick={connect}
              disabled={!hasMetaMask}
              className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium py-3 rounded-xl transition-all text-sm"
            >
              <Wallet className="w-4 h-4" />
              {hasMetaMask ? 'Conectar sua MetaMask para enviar' : 'MetaMask não encontrada'}
            </button>
          </div>
        )}

        {isConnected && (
          <div className="mb-5 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5" />
            MetaMask conectada · {formattedAddress}
          </div>
        )}

        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">Quantidade de PGT</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 10"
              min="0.0001"
              step="any"
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm pr-16 focus:outline-none focus:ring-2 focus:ring-piaget-500/50 focus:border-piaget-500 placeholder:text-muted-foreground transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-piaget-400">PGT</span>
          </div>
          <div className="flex gap-2">
            {['5', '10', '25', '50'].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                  amount === v
                    ? 'border-piaget-500 text-piaget-400 bg-piaget-950'
                    : 'border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Participação em aula, Tarefa entregue..."
            maxLength={100}
            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-piaget-500/50 focus:border-piaget-500 placeholder:text-muted-foreground transition-all"
          />
        </div>

        {txHash && (
          <div className="mb-5 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
            <div className="text-xs text-green-400 flex items-center gap-1 mb-1">
              <CheckCircle className="w-3.5 h-3.5" /> Transação enviada!
            </div>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-piaget-400 hover:text-piaget-300 flex items-center gap-1"
            >
              {formatAddress(txHash)} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={isSending || !isConnected || !student.wallet || !amount}
          className="w-full bg-piaget-600 hover:bg-piaget-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde a MetaMask...</>
          ) : (
            <><Send className="w-4 h-4" /> Enviar {amount ? `${amount} PGT` : 'PGT'}</>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          A MetaMask vai abrir para você confirmar a transação
        </p>
      </motion.div>
    </div>
  )
}

// ─── Dashboard Principal ─────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [students, setStudents] = useState<StudentWithWallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentWithWallet | null>(null)
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null)

  const { isConnected, formattedAddress, balance, connect, hasMetaMask } = useWallet(userId)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      setUserName(profile?.full_name ?? 'Usuário')

      const { data: studentsData } = await supabase
        .from('profiles')
        .select(`*, wallets(*)`)
        .eq('role', 'student')
        .order('full_name')

      const mapped: StudentWithWallet[] = (studentsData ?? []).map((s: unknown) => {
        const row = s as Record<string, unknown>
        const wallets = row.wallets
        const wallet = Array.isArray(wallets) && wallets.length > 0
          ? wallets[0] as WalletType
          : null
        return {
          id: row.id as string,
          full_name: row.full_name as string,
          email: row.email as string,
          role: row.role as Profile['role'],
          avatar_url: row.avatar_url as string | null,
          created_at: row.created_at as string,
          updated_at: row.updated_at as string,
          wallet,
        }
      })
      setStudents(mapped)

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setTransactions(txData ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddr(text)
    toast.success('Endereço copiado!')
    setTimeout(() => setCopiedAddr(null), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-piaget-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-bg">

      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-piaget-gradient flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">PiagetCoin</span>
            <span className="text-xs text-muted-foreground hidden sm:block">· Painel Admin/Professor</span>
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {formattedAddress} · {balance} PGT
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={!hasMetaMask}
                className="hidden sm:flex items-center gap-2 bg-piaget-600/20 hover:bg-piaget-600/30 border border-piaget-600/30 text-piaget-400 text-xs px-3 py-1.5 rounded-lg transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                Conectar MetaMask
              </button>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Alunos cadastrados', value: students.length, icon: Users, color: 'text-piaget-400' },
            { label: 'Com carteira conectada', value: students.filter(s => s.wallet).length, icon: Wallet, color: 'text-green-400' },
            { label: 'Sem carteira', value: students.filter(s => !s.wallet).length, icon: AlertCircle, color: 'text-amber-400' },
            { label: 'Transações enviadas', value: transactions.length, icon: Send, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4 border border-border"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-piaget-400" />
              Alunos
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar aluno..."
                  className="bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-piaget-500/50 w-44 transition-all"
                />
              </div>
              <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Aluno</th>
                  <th className="text-left px-5 py-3 font-medium">Carteira (MetaMask)</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Saldo PGT</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                      {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado ainda'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((student, i) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-piaget-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{student.full_name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {student.wallet ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-piaget-400">
                              {formatAddress(student.wallet.address)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(student.wallet!.address)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {copiedAddr === student.wallet.address
                                ? <CheckCircle className="w-3 h-3 text-green-400" />
                                : <Copy className="w-3 h-3" />}
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/address/${student.wallet.address}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-piaget-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Não conectada</span>
                        )}
                      </td>

                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm font-medium gradient-text">
                          {student.wallet
                            ? `${formatPGT(student.wallet.balance_pgt)} PGT`
                            : '—'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {student.wallet ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                            <div className="w-1 h-1 bg-green-400 rounded-full" />
                            Conectado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            <div className="w-1 h-1 bg-amber-400 rounded-full" />
                            Pendente
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          disabled={!student.wallet}
                          title={!student.wallet ? 'Aluno não conectou a carteira' : `Enviar PGT para ${student.full_name}`}
                          className="flex items-center gap-1.5 text-xs bg-piaget-600 hover:bg-piaget-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                        >
                          <Send className="w-3 h-3" />
                          Enviar PGT
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="mt-8 glass rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-piaget-400" />
                Últimas transações enviadas
              </h2>
            </div>
            <div className="divide-y divide-border/30">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium">{tx.reason || 'Recompensa PGT'}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold gradient-text-gold text-sm">+{tx.amount} PGT</span>
                    {tx.tx_hash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-piaget-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'confirmed'
                        ? 'bg-green-500/10 text-green-400'
                        : tx.status === 'failed'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {tx.status === 'confirmed' ? 'Confirmado' : tx.status === 'failed' ? 'Falhou' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <SendModal
            student={selectedStudent}
            senderUserId={userId}
            onClose={() => setSelectedStudent(null)}
            onSuccess={() => { setSelectedStudent(null); loadData() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           