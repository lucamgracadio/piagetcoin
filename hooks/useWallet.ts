'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  connectWallet,
  formatAddress,
  formatPGT,
  getConnectedAccount,
  getPGTBalance,
  isMetaMaskInstalled,
  sendPGT,
  waitForTransaction,
} from '@/lib/web3/metamask'
import { createClient } from '@/lib/supabase/client'
import type { WalletState, SendTokenParams, TransactionResult } from '@/types'

export function useWallet(userId?: string) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    balance: null,
    ethBalance: null,
    error: null,
  })
  const [isSending, setIsSending] = useState(false)

  // ─── Carregar saldo PGT ─────────────────────────────────────
  const loadBalance = useCallback(async (address: string) => {
    const balance = await getPGTBalance(address)
    setState(prev => ({ ...prev, balance: formatPGT(balance) }))
  }, [])

  // ─── Salvar wallet no Supabase ──────────────────────────────
  const saveWalletToDb = useCallback(
    async (address: string) => {
      if (!userId) return
      const supabase = createClient()
      const { error } = await supabase.from('wallets').upsert(
        { user_id: userId, address: address.toLowerCase(), updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      if (error) console.error('Erro ao salvar wallet:', error)
    },
    [userId]
  )

  // ─── Conectar MetaMask ──────────────────────────────────────
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }))
    try {
      const address = await connectWallet()
      await loadBalance(address)
      await saveWalletToDb(address)
      setState(prev => ({
        ...prev,
        address,
        isConnected: true,
        isConnecting: false,
        error: null,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar'
      setState(prev => ({ ...prev, isConnecting: false, error: message }))
    }
  }, [loadBalance, saveWalletToDb])

  // ─── Verificar conexão existente ao carregar ────────────────
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    getConnectedAccount().then(async (account) => {
      if (account) {
        await loadBalance(account)
        setState(prev => ({ ...prev, address: account, isConnected: true }))
      }
    })

    // Ouvir mudança de conta
    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        setState(prev => ({ ...prev, address: null, isConnected: false, balance: null }))
      } else {
        const newAddress = accs[0].toLowerCase()
        setState(prev => ({ ...prev, address: newAddress, isConnected: true }))
        loadBalance(newAddress)
        if (userId) saveWalletToDb(newAddress)
      }
    }

    // Ouvir mudança de rede
    const handleChainChanged = () => window.location.reload()

    window.ethereum?.on('accountsChanged', handleAccountsChanged)
    window.ethereum?.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [loadBalance, saveWalletToDb, userId])

  // ─── Enviar PGT ─────────────────────────────────────────────
  const send = useCallback(
    async (params: SendTokenParams): Promise<TransactionResult> => {
      setIsSending(true)
      try {
        const txHash = await sendPGT(params.toAddress, params.amount)

        // Aguardar confirmação em background
        waitForTransaction(txHash).then(async (confirmed) => {
          if (state.address) await loadBalance(state.address)

          // Salvar transação no Supabase
          const supabase = createClient()
          await supabase.from('transactions').insert({
            from_user_id: userId,
            amount: parseFloat(params.amount),
            reason: params.reason,
            tx_hash: txHash,
            status: confirmed ? 'confirmed' : 'failed',
          })
        })

        setIsSending(false)
        return { hash: txHash, status: 'pending' }
      } catch (err) {
        setIsSending(false)
        const message = err instanceof Error ? err.message : 'Erro ao enviar'
        throw new Error(message)
      }
    },
    [state.address, userId, loadBalance]
  )

  return {
    ...state,
    hasMetaMask: isMetaMaskInstalled(),
    formattedAddress: state.address ? formatAddress(state.address) : null,
    connect,
    send,
    isSending,
    refreshBalance: () => state.address && loadBalance(state.address),
  }
}
