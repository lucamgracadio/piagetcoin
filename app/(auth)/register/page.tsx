'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Coins, Eye, EyeOff, Loader2, Mail, Lock, User, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: 'student',   label: 'Aluno',      desc: 'Recebo PGT por atividades' },
  { value: 'professor', label: 'Professor',   desc: 'Envio PGT para alunos' },
  { value: 'admin',     label: 'Administrador', desc: 'Gestão completa da plataforma' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })

      if (error) throw error

      toast.success('Conta criada! Verifique seu email para confirmar.')
      router.push('/login')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta'
      toast.error(msg.includes('already registered') ? 'Email já cadastrado' : msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-piaget-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-piaget-gradient flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">PiagetCoin</span>
          </Link>
          <h1 className="text-2xl font-bold">Criar sua conta</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Comece a usar o PiagetCoin hoje
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-border">
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-piaget-500/50 focus:border-piaget-500
                    placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-piaget-500/50 focus:border-piaget-500
                    placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-12 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-piaget-500/50 focus:border-piaget-500
                    placeholder:text-muted-foreground transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tipo de conta */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Tipo de conta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === r.value
                        ? 'border-piaget-500 bg-piaget-950 text-piaget-300'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-piaget-600 hover:bg-piaget-500 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]
                flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Criando conta...</>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="text-piaget-400 hover:text-piaget-300 font-medium">
              Fazer login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
