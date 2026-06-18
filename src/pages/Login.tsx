import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, Package, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { authApi } from '@/api/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company_id: z.string().min(1, 'Company ID is required'),
})

const setupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company_id: z.string().min(1, 'Company ID is required'),
  company_name: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>
type SetupFormData = z.infer<typeof setupSchema>

export function Login() {
  const { login, setupAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [needsSetup, setNeedsSetup] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      company_id: 'CTS',
    },
  })

  const setupForm = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      company_id: 'CTS',
      company_name: '',
    },
  })

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await authApi.getSetupStatus()
        setNeedsSetup(status.needsSetup)
      } catch {
        setNeedsSetup(false)
      } finally {
        setCheckingSetup(false)
      }
    }

    checkSetup()
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed'
      toast.error(message)

      if (message.includes('email') || message.includes('user')) {
        loginForm.setError('email', { message })
      } else if (message.includes('password')) {
        loginForm.setError('password', { message })
      } else if (message.includes('company')) {
        loginForm.setError('company_id', { message })
      } else {
        loginForm.setError('root', { message })
      }
    }
  }

  const onSetupSubmit = async (data: SetupFormData) => {
    try {
      await setupAdmin(data)
      toast.success('Admin account created successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || 'Failed to create admin account'
      toast.error(message)
      setupForm.setError('root', { message })
    }
  }

  const isSubmitting = needsSetup
    ? setupForm.formState.isSubmitting
    : loginForm.formState.isSubmitting

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Lilstock</h1>
          <p className="text-muted-foreground mt-1">Multi-Site Stock Management</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {checkingSetup ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : needsSetup ? (
            <>
              <h2 className="text-xl font-semibold text-card-foreground mb-2 text-center">
                Create Admin Account
              </h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                No users found in this database. Create the first admin account to get started.
              </p>

              <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name
                  </label>
                  <input
                    {...setupForm.register('name')}
                    id="name"
                    type="text"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                      setupForm.formState.errors.name ? 'border-destructive bg-destructive/10' : 'border-input'
                    }`}
                    placeholder="Admin User"
                  />
                  {setupForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-destructive">
                      {setupForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="setup-email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <input
                    {...setupForm.register('email')}
                    id="setup-email"
                    type="email"
                    autoComplete="email"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                      setupForm.formState.errors.email ? 'border-destructive bg-destructive/10' : 'border-input'
                    }`}
                    placeholder="admin@company.com"
                  />
                  {setupForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {setupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="setup-password" className="block text-sm font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <input
                    {...setupForm.register('password')}
                    id="setup-password"
                    type="password"
                    autoComplete="new-password"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                      setupForm.formState.errors.password ? 'border-destructive bg-destructive/10' : 'border-input'
                    }`}
                    placeholder="••••••••"
                  />
                  {setupForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-destructive">
                      {setupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-foreground mb-1.5">
                    Company Name
                  </label>
                  <input
                    {...setupForm.register('company_name')}
                    id="company_name"
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground border-input"
                    placeholder="CTS"
                  />
                </div>

                <div>
                  <label htmlFor="setup-company_id" className="block text-sm font-medium text-foreground mb-1.5">
                    Company ID
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...setupForm.register('company_id')}
                      id="setup-company_id"
                      type="text"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                        setupForm.formState.errors.company_id ? 'border-destructive bg-destructive/10' : 'border-input'
                      }`}
                      placeholder="CTS"
                    />
                  </div>
                  {setupForm.formState.errors.company_id && (
                    <p className="mt-1 text-sm text-destructive">
                      {setupForm.formState.errors.company_id.message}
                    </p>
                  )}
                </div>

                {setupForm.formState.errors.root && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{setupForm.formState.errors.root.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating admin...
                    </>
                  ) : (
                    'Create Admin Account'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-card-foreground mb-6 text-center">
                Sign in to your account
              </h2>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <input
                    {...loginForm.register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                      loginForm.formState.errors.email ? 'border-destructive bg-destructive/10' : 'border-input'
                    }`}
                    placeholder="admin@lilstock.com"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <input
                    {...loginForm.register('password')}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                      loginForm.formState.errors.password ? 'border-destructive bg-destructive/10' : 'border-input'
                    }`}
                    placeholder="••••••••"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company_id" className="block text-sm font-medium text-foreground mb-1.5">
                    Company ID
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...loginForm.register('company_id')}
                      id="company_id"
                      type="text"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background text-foreground ${
                        loginForm.formState.errors.company_id ? 'border-destructive bg-destructive/10' : 'border-input'
                      }`}
                      placeholder="CTS"
                    />
                  </div>
                  {loginForm.formState.errors.company_id && (
                    <p className="mt-1 text-sm text-destructive">{loginForm.formState.errors.company_id.message}</p>
                  )}
                </div>

                {loginForm.formState.errors.root && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{loginForm.formState.errors.root.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © {new Date().getFullYear()} Lilstock. All rights reserved.
        </p>
      </div>
    </div>
  )
}
