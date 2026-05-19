'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, Coins, GraduationCap, Shield, Zap,
  Users, Award, BarChart3, CheckCircle2, Wallet
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' }
  }),
}

const stats = [
  { label: 'Alunos Ativos', value: '14', suffix: '+' },
  { label: 'Total de PGT', value: '10M', suffix: '' },
  { label: 'Rede', value: 'Sepolia', suffix: '' },
  { label: 'Transações', value: '100%', suffix: ' seguras' },
]

const features = [
  {
    icon: Coins,
    title: 'Token Real na Blockchain',
    desc: 'PiagetCoin (PGT) é um token ERC-20 real na rede Ethereum Sepolia. Cada recompensa é uma transação blockchain verificável.',
  },
  {
    icon: Zap,
    title: 'Envio em 1 Clique',
    desc: 'Selecione o aluno, informe a quantidade e clique em enviar. A MetaMask cuida do resto — sem digitar endereços.',
  },
  {
    icon: Shield,
    title: 'Totalmente Seguro',
    desc: 'Nenhuma chave privada é armazenada no servidor. Todas as transações são assinadas diretamente na MetaMask do professor.',
  },
  {
    icon: Users,
    title: 'Gestão de Turmas',
    desc: 'Organize alunos em turmas, acompanhe rankings e veja quem recebeu mais recompensas no mês.',
  },
  {
    icon: Award,
    title: 'Badges e Conquistas',
    desc: 'Alunos acumulam conquistas conforme recebem PGT, criando um sistema de gamificação motivador.',
  },
  {
    icon: BarChart3,
    title: 'Histórico Completo',
    desc: 'Todo envio fica registrado com data, motivo e hash da transação — rastreável para sempre na blockchain.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background grid-bg overflow-hidden">

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-piaget-gradient flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">PiagetCoin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-piaget-600 hover:bg-piaget-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-piaget-950 border border-piaget-800 text-piaget-300 text-xs font-medium px-4 py-2 rounded-full mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-piaget-400 animate-pulse" />
            Token ERC-20 · Sepolia Testnet · 10.000.000 PGT
          </motion.div>

          {/* Título */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Recompense alunos com{' '}
            <span className="gradient-text">moeda digital</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Professores enviam <strong className="text-foreground">PiagetCoin (PGT)</strong> para
            alunos em um clique. Blockchain real, sem complicações, direto na MetaMask.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-piaget-600 hover:bg-piaget-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105"
            >
              Começar agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 glass hover:bg-white/5 border border-border text-foreground font-medium px-8 py-4 rounded-xl transition-all duration-200"
            >
              <Wallet className="w-4 h-4" />
              Já tenho conta
            </Link>
          </motion.div>
        </div>

        {/* Coin flutuante */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-20 flex justify-center"
        >
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-piaget-500/20 blur-3xl animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-piaget-500 to-piaget-700 coin-glow flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <div className="text-4xl font-black text-white">PGT</div>
                <div className="text-xs text-piaget-200 mt-1">Piagetcoin</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i}
              className="text-center"
            >
              <div className="text-3xl font-black gradient-text">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Como funciona ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg">Simples para professores, motivador para alunos</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Aluno conecta a carteira', desc: 'No primeiro acesso, o aluno conecta a MetaMask. O endereço é salvo automaticamente — nunca mais precisa digitar.', icon: Wallet },
              { num: '02', title: 'Professor seleciona e envia', desc: 'O professor entra no painel, escolhe o aluno na lista, informa a quantidade de PGT e o motivo, e clica em Enviar.', icon: GraduationCap },
              { num: '03', title: 'MetaMask confirma', desc: 'A MetaMask do professor abre para confirmar. Após aprovação, o PGT chega na carteira do aluno na blockchain.', icon: CheckCircle2 },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={i}
                className="glass rounded-2xl p-6 hover:border-piaget-800 transition-all duration-300"
              >
                <div className="text-piaget-600 text-xs font-mono font-bold mb-4">{step.num}</div>
                <step.icon className="w-8 h-8 text-piaget-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa</h2>
            <p className="text-muted-foreground text-lg">Uma plataforma completa para recompensas escolares</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={i * 0.5}
                className="glass rounded-2xl p-6 hover:border-piaget-800/50 hover:bg-piaget-950/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-piaget-950 border border-piaget-800 flex items-center justify-center mb-4 group-hover:border-piaget-600 transition-colors">
                  <feature.icon className="w-5 h-5 text-piaget-400" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-piaget-900/50"
          >
            <div className="w-16 h-16 rounded-2xl bg-piaget-gradient flex items-center justify-center mx-auto mb-6">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8">
              Configure sua escola em minutos. Conecte a MetaMask e comece a recompensar alunos hoje.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-piaget-600 hover:bg-piaget-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105"
            >
              Criar conta gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-piaget-400" />
            <span className="text-sm font-medium">PiagetCoin</span>
            <span className="text-xs text-muted-foreground">· Token ERC-20 na Sepolia</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Contrato: 0x4144...F162
          </div>
        </div>
      </footer>
    </div>
  )
}
