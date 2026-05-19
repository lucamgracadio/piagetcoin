'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Coins, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      // Buscar role do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      toast.success('Bem-vindo de volta!')

      // Redirecionar conforme role
      if (profile?.role === 'admin') router.push('/dashboard/admin')
      else if (profile?.role === 'professor') router.push('/dashboard/professor')
      else router.push('/dashboard/student')

      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login'
      toast.error(msg === 'Invalid login credentials' ? 'Email ou senha incorretos' : msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-6">
      {/* Glow de fundo */}
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
          <h1 className="text-2xl font-bold">Entrar na plataforma</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Use seu email e senha para acessar
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-border">
          <form onSubmit={handleLogin} className="space-y-5">

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

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-piaget-600 hover:bg-piaget-500 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/register" className="text-piaget-400 hover:text-piaget-300 font-medium">
              Cadastre-se
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
