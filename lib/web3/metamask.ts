import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers'
import {
  ERC20_ABI,
  NETWORK_CONFIG,
  PGT_CONTRACT_ADDRESS,
  PGT_DECIMALS,
  SEPOLIA_CHAIN_ID,
} from './config'

// ─── Tipos ───────────────────────────────────────────────────

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

// ─── Verificar MetaMask ───────────────────────────────────────

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
}

// ─── Conectar carteira ────────────────────────────────────────

export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask não encontrada. Instale a extensão em metamask.io')
  }

  const accounts = (await window.ethereum!.request({
    method: 'eth_requestAccounts',
  })) as string[]

  if (!accounts || accounts.length === 0) {
    throw new Error('Nenhuma conta conectada')
  }

  // Verificar e trocar para Sepolia se necessário
  await ensureSepoliaNetwork()

  return accounts[0].toLowerCase()
}

// ─── Garantir rede Sepolia ────────────────────────────────────

export async function ensureSepoliaNetwork(): Promise<void> {
  const chainId = (await window.ethereum!.request({
    method: 'eth_chainId',
  })) as string

  const currentChainId = parseInt(chainId, 16)

  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    try {
      // Tentar trocar para Sepolia
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      })
    } catch (error: unknown) {
      // Se a rede não existe na MetaMask, adicionar
      const err = error as { code?: number }
      if (err.code === 4902) {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        })
      } else {
        throw new Error('Por favor, troque para a rede Sepolia na MetaMask')
      }
    }
  }
}

// ─── Obter conta conectada ────────────────────────────────────

export async function getConnectedAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null
  try {
    const accounts = (await window.ethereum!.request({
      method: 'eth_accounts',
    })) as string[]
    return accounts.length > 0 ? accounts[0].toLowerCase() : null
  } catch {
    return null
  }
}

// ─── Obter provider + signer ──────────────────────────────────

export async function getProvider(): Promise<BrowserProvider> {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask não encontrada')
  return new BrowserProvider(window.ethereum!)
}

// ─── Obter saldo PGT de um endereço ──────────────────────────

export async function getPGTBalance(address: string): Promise<string> {
  try {
    const provider = await getProvider()
    const contract = new Contract(PGT_CONTRACT_ADDRESS, ERC20_ABI, provider)
    const balance = await contract.balanceOf(address)
    return formatUnits(balance, PGT_DECIMALS)
  } catch (err) {
    console.error('Erro ao buscar saldo PGT:', err)
    return '0'
  }
}

// ─── Enviar PGT para um endereço ─────────────────────────────

export async function sendPGT(
  toAddress: string,
  amount: string
): Promise<string> {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask não encontrada')

  await ensureSepoliaNetwork()

  const provider = await getProvider()
  const signer = await provider.getSigner()
  const contract = new Contract(PGT_CONTRACT_ADDRESS, ERC20_ABI, signer)

  // Converter amount para wei (com 18 decimais)
  const amountWei = parseUnits(amount, PGT_DECIMALS)

  // Verificar saldo antes de enviar
  const signerAddress = await signer.getAddress()
  const balance = await contract.balanceOf(signerAddress)

  if (balance < amountWei) {
    throw new Error(
      `Saldo insuficiente. Você tem ${formatUnits(balance, PGT_DECIMALS)} PGT`
    )
  }

  // Executar transferência — MetaMask abre popup para o usuário confirmar
  const tx = await contract.transfer(toAddress, amountWei)

  return tx.hash as string
}

// ─── Aguardar confirmação de transação ───────────────────────

export async function waitForTransaction(txHash: string): Promise<boolean> {
  try {
    const provider = await getProvider()
    const receipt = await provider.waitForTransaction(txHash, 1)
    return receipt?.status === 1
  } catch {
    return false
  }
}

// ─── Formatar endereço ────────────────────────────────────────

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// ─── Formatar saldo ───────────────────────────────────────────

export function formatPGT(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(num)
}
