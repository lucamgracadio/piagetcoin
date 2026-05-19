// ============================================================
// PiagetCoin — Tipos TypeScript globais
// ============================================================

export type UserRole = 'admin' | 'professor' | 'student'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  address: string
  balance_pgt: number
  connected_at: string
  updated_at: string
}

export interface Classroom {
  id: string
  name: string
  description?: string | null
  professor_id?: string | null
  created_at: string
}

export interface StudentClassroom {
  student_id: string
  classroom_id: string
  joined_at: string
}

export interface Transaction {
  id: string
  from_user_id?: string | null
  to_user_id?: string | null
  amount: number
  reason?: string | null
  tx_hash?: string | null
  status: 'pending' | 'confirmed' | 'failed'
  classroom_id?: string | null
  created_at: string
  // Joined fields
  from_profile?: Profile
  to_profile?: Profile
}

export interface Activity {
  id: string
  title: string
  description?: string | null
  reward_pgt: number
  classroom_id?: string | null
  created_by?: string | null
  created_at: string
}

// ─── View types (joins) ───────────────────────────────────────

export interface StudentWithWallet extends Profile {
  wallet?: Wallet | null
  classroom_name?: string | null
}

export interface TransactionWithProfiles extends Transaction {
  from_profile?: Profile | null
  to_profile?: Profile | null
}

// ─── Web3 ────────────────────────────────────────────────────

export interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  balance: string | null  // saldo PGT formatado
  ethBalance: string | null
  error: string | null
}

export interface SendTokenParams {
  toAddress: string
  amount: string
  studentName?: string
  reason?: string
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
}

// ─── API Response ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ─── Dashboard ────────────────────────────────────────────────

export interface DashboardStats {
  totalStudents: number
  totalTransactions: number
  totalPgtSent: number
  activeClassrooms: number
}

export interface StudentDashboardData {
  profile: Profile
  wallet: Wallet | null
  transactions: TransactionWithProfiles[]
  rank: number
  totalReceived: number
}
