// ============================================================
// Configuração Web3 — PiagetCoin Sepolia Testnet
// ============================================================

export const SEPOLIA_CHAIN_ID = 11155111

export const NETWORK_CONFIG = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`, // '0xaa36a7'
  chainName: 'Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
}

// Contrato PiagetCoin (PGT) — Sepolia
export const PGT_CONTRACT_ADDRESS = '0x4144fBfa3f247dc18fF7B94e809c4FF42301F162'
export const PGT_DECIMALS = 18
export const PGT_SYMBOL = 'PGT'
export const PGT_NAME = 'Piagetcoin'

// ABI mínima ERC-20 (apenas as funções necessárias para o site)
export const ERC20_ABI = [
  // Leitura
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  // Escrita
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  // Eventos
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const
