'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Coins, Wallet, Copy, CheckCircle, LogOut,
  ExternalLink, Loader2, Trophy, TrendingUp, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { useWallet } from '@/hooks/useWallet'
import { formatAddress, formatPGT } from '@/lib/web3/metamask'
import type { Profile, Transaction } from '@/types'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<(Transaction & { from_name?: string })[]>([])
  const [rank, setRank] = useState<number>(0)
  const [totalReceived, setTotalReceived] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const { isConnected, address, balance, connect, hasMetaMask, formattedAddress } = useWallet(userId)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      // Transações recebidas
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setTransactions(txs ?? [])
      const total = (txs ?? []).reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
      setTotalReceived(total)

      // Ranking simples: posição pelo total de PGT recebido
      const { data: allTotals } = await supabase
        .from('transactions')
        .select('to_user_id, amount')
        .eq('status', 'confirmed')

      if (allTotals) {
        const totals: Record<string, number> = {}
        allTotals.forEach((t: { to_user_id: string; amount: number }) => {
          totals[t.to_user_id] = (totals[t.to_user_id] ?? 0) + Number(t.amount)
        })
        const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)
        const pos = sorted.findIndex(([id]) => id === user.id)
        setRank(pos >= 0 ? pos + 1 : sorted.length + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => { loadData() }, [loadData])

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success('Endereço copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-piaget-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-bg">

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-piaget-gradient flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">PiagetCoin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{profile?.full_name}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ─── Card de Saldo ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-piaget-500/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Seu saldo PGT</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black gradient-text">
                  {isConnected ? formatPGT(balance ?? '0') : '—'}
                </span>
                <span className="text-xl font-bold text-muted-foreground mb-1">PGT</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Piagetcoin · Sepolia Testnet</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Botão conectar / status wallet */}
              {!isConnected ? (
                <button
                  onClick={connect}
                  disabled={!hasMetaMask}
                  className="flex items-center gap-2 bg-piaget-600 hover:bg-piaget-500 disabled:opacity-50
                    text-white font-semibold px-5 py-3 rounded-xl transition-all hover:scale-105"
                >
                  <Wallet className="w-4 h-4" />
                  {hasMetaMask ? 'Conectar MetaMask' : 'Instalar MetaMask'}
                </button>
              ) : (
                <div className="bg-muted/30 rounded-xl p-4 border border-border min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">MetaMask conectada</span>
                  </div>
                  <div className="font-mono text-sm text-piaget-300 mb-2">{formattedAddress}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <a
                      href={`https://sepolia.etherscan.io/address/${address}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-piaget-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Etherscan
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── Stats rápidas ──────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: 'Total recebido', value: `${formatPGT(totalReceived)} PGT`, color: 'text-piaget-400' },
            { icon: Trophy, label: 'Ranking', value: rank > 0 ? `#${rank}` : '—', color: 'text-gold-400' },
            { icon: Clock, label: 'Transações', value: transactions.length, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="glass rounded-xl p-4 border border-border text-center"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── Histórico de recompensas ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Coins className="w-4 h-4 text-piaget-400" />
              Histórico de recompensas
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma recompensa recebida ainda</p>
              <p className="text-xs mt-1">Participe das atividades para ganhar PGT!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-piaget-950 border border-piaget-800 flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 text-piaget-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{tx.reason || 'Recompensa PGT'}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-piaget-400">+{tx.amount} PGT</div>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={`text-xs ${
                        tx.status === 'confirmed' ? 'text-green-400' :
                        tx.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {tx.status === 'confirmed' ? 'Confirmado' : tx.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </span>
                      {tx.tx_hash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-piaget-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
