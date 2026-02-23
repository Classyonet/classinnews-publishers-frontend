'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { API_URL, getToken } from '@/lib/api'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Eye,
  Smartphone,
  User,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  Clock,
  CheckCheck,
  XCircle,
  Star,
  Percent,
  Info,
  Award
} from 'lucide-react'

interface PaymentDetails {
  id: number
  paymentMethod: string
  registeredName: string
  phoneNumber: string
  isComplete: boolean
}

interface WithdrawalRequest {
  id: number
  amount: number
  status: string
  requestDate: string
  processedDate?: string
  adminNotes?: string
  commissionRate?: number
  commissionAmount?: number
  netAmount?: number
  tierAtWithdrawal?: string
}

interface CommissionInfo {
  rate: number
  tierName: string
  starRating: number
  totalEarnings?: number
  withdrawnAmount?: number
  availableBalance?: number
  tierRates?: Array<{
    key: string
    tier: string
    stars: number
    rate: number
  }>
}

interface ArticleEarning {
  articleId: number
  title: string
  slug: string
  publishedAt: string
  views: number
  likes: number
  shares: number
  viewsEarning: number
  sharesEarning: number
  likesEarning: number
  totalEarning: number
}

interface EarningsData {
  total: { total: number; articles: ArticleEarning[] }
  currentWeek: { total: number; articles: ArticleEarning[] }
  currentMonth: { total: number; articles: ArticleEarning[] }
}

export default function RevenuePage() {
  const { user } = useAuth()
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const revenueBuildTag = '2026-02-23-r1'
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [commissionInfo, setCommissionInfo] = useState<CommissionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  const [paymentForm, setPaymentForm] = useState({
    registeredName: '',
    phoneNumber: ''
  })
  
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const minWithdrawalAmount = 50
  const defaultTierRates = [
    { key: 'commission_new_tier', tier: 'New', stars: 0, rate: 30 },
    { key: 'commission_starter_tier', tier: 'Starter', stars: 1, rate: 25 },
    { key: 'commission_bronze_tier', tier: 'Bronze', stars: 2, rate: 20 },
    { key: 'commission_silver_tier', tier: 'Silver', stars: 3, rate: 15 },
    { key: 'commission_platinum_tier', tier: 'Platinum', stars: 4, rate: 10 },
    { key: 'commission_gold_tier', tier: 'Gold', stars: 5, rate: 0 },
  ]

  const stats = [
    {
      title: 'Total Earnings',
      value: earnings ? `GHC ${earnings.total.total.toFixed(2)}` : 'GHC 0.00',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/30',
      bgGradient: 'from-emerald-50 to-teal-50',
      change: earnings ? `${earnings.total.articles.length} articles` : '+0%'
    },
    {
      title: 'This Month',
      value: earnings ? `GHC ${earnings.currentMonth.total.toFixed(2)}` : 'GHC 0.00',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/30',
      bgGradient: 'from-blue-50 to-cyan-50',
      change: currentMonth
    },
    {
      title: 'This Week',
      value: earnings ? `GHC ${earnings.currentWeek.total.toFixed(2)}` : 'GHC 0.00',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-yellow-500',
      shadowColor: 'shadow-amber-500/30',
      bgGradient: 'from-amber-50 to-yellow-50',
      change: earnings ? `${earnings.currentWeek.articles.length} articles` : 'Processing'
    }
  ]

  const totalEarningsAmount = earnings?.total?.total ?? commissionInfo?.totalEarnings ?? 0
  const reservedWithdrawalAmount = commissionInfo?.withdrawnAmount ?? withdrawals
    .filter((withdrawal) => withdrawal.status !== 'rejected')
    .reduce((sum, withdrawal) => sum + (Number(withdrawal.amount) || 0), 0)
  const availableBalance = Math.max(0, totalEarningsAmount - reservedWithdrawalAmount)

  useEffect(() => {
    setApiError(null)
    fetchPaymentDetails()
    fetchWithdrawals()
    fetchEarnings()
    fetchCommissionInfo()
  }, [])

  const fetchPaymentDetails = async () => {
    try {
      const token = getToken()
      if (!token) {
        setApiError('Authentication is required to load revenue data.')
        return
      }

      const response = await fetch(`${API_URL}/api/payment-details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setPaymentDetails(data)
        if (data) {
          setPaymentForm({
            registeredName: data.registeredName,
            phoneNumber: data.phoneNumber
          })
        }
      } else {
        const error = await response.json().catch(() => null)
        setApiError(error?.message || 'Failed to load payment details.')
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error)
      setApiError('Failed to load payment details.')
    } finally {
      setLoading(false)
    }
  }

  const fetchWithdrawals = async () => {
    try {
      const token = getToken()
      if (!token) {
        setApiError('Authentication is required to load withdrawal history.')
        return
      }

      const response = await fetch(`${API_URL}/api/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setWithdrawals(result.data || result || [])
      } else {
        const error = await response.json().catch(() => null)
        setApiError(error?.message || 'Failed to load withdrawal history.')
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      setApiError('Failed to load withdrawal history.')
    }
  }

  const validatePaymentDetails = () => {
    const errors: string[] = []
    
    if (!paymentForm.registeredName.trim()) {
      errors.push('Registered Name is required')
    }
    
    if (!paymentForm.phoneNumber.trim()) {
      errors.push('Phone Number is required')
    } else if (!/^[0-9+\-\s()]+$/.test(paymentForm.phoneNumber)) {
      errors.push('Phone Number must contain only numbers and valid characters')
    }
    
    return errors
  }

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true)
      const token = getToken()
      if (!token) {
        setApiError('Authentication is required to load earnings.')
        return
      }

      const response = await fetch(`${API_URL}/api/my-earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setEarnings(result.data || result)
      } else {
        const error = await response.json().catch(() => null)
        setApiError(error?.message || 'Failed to load earnings data.')
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
      setApiError('Failed to load earnings data.')
    } finally {
      setEarningsLoading(false)
    }
  }

  const fetchCommissionInfo = async () => {
    try {
      const token = getToken()
      if (!token) {
        setApiError('Authentication is required to load commission details.')
        return
      }

      const response = await fetch(`${API_URL}/api/commission-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const result = await response.json()
        setCommissionInfo(result.data || result)
      } else {
        const error = await response.json().catch(() => null)
        setApiError(error?.message || 'Failed to load commission information.')
      }
    } catch (error) {
      console.error('Failed to fetch commission info:', error)
      setApiError('Failed to load commission information.')
    }
  }

  // Calculate commission preview for withdrawal
  const calculateCommission = (amount: number) => {
    const rate = commissionInfo?.rate ?? 30
    const commission = (amount * rate) / 100
    const net = amount - commission
    return { rate, commission, net }
  }

  const handleSavePaymentDetails = async () => {
    const errors = validatePaymentDetails()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setProcessing(true)
    setValidationErrors([])

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/payment-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: 'mobile_money',
          registeredName: paymentForm.registeredName,
          phoneNumber: paymentForm.phoneNumber
        })
      })

      if (response.ok) {
        const data = await response.json()
        setShowPaymentModal(false)
        alert('Payment details saved successfully!')
        // Refetch to get updated payment details
        await fetchPaymentDetails()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save payment details')
      }
    } catch (error) {
      console.error('Failed to save payment details:', error)
      alert('Failed to save payment details')
    } finally {
      setProcessing(false)
    }
  }

  const validateWithdrawal = () => {
    const errors: string[] = []
    
    if (!paymentDetails) {
      errors.push('Payment details not found')
      return errors
    }
    
    if (!paymentDetails.isComplete) {
      if (!paymentDetails.registeredName) errors.push('Registered Name is missing')
      if (!paymentDetails.phoneNumber) errors.push('Phone Number is missing')
    }
    
    const amount = parseFloat(withdrawAmount)
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      errors.push('Please enter a valid amount')
    } else {
      if (amount < minWithdrawalAmount) {
        errors.push(`Minimum withdrawal amount is GHC ${minWithdrawalAmount.toFixed(2)}`)
      }
      if (amount > availableBalance) {
        errors.push(`Insufficient available balance. You can withdraw up to GHC ${availableBalance.toFixed(2)}`)
      }
    }
    
    return errors
  }

  const handleWithdrawRequest = async () => {
    const errors = validateWithdrawal()
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setProcessing(true)
    setValidationErrors([])

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount)
        })
      })

      if (response.ok) {
        await response.json()
        await Promise.all([fetchWithdrawals(), fetchCommissionInfo()])
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        alert('Withdrawal request submitted successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to submit withdrawal request')
      }
    } catch (error) {
      console.error('Failed to submit withdrawal:', error)
      alert('Failed to submit withdrawal request')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      completed: CheckCheck,
      rejected: XCircle
    }
    
    const Icon = icons[status as keyof typeof icons] || Clock
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Revenue</h1>
          <p className="text-slate-600 mt-1">Track your earnings and payment history</p>
          <p className="text-xs text-slate-400 mt-1">Build {revenueBuildTag}</p>
        </div>
        <button className="px-4 py-2.5 bg-white text-purple-600 border border-purple-200 rounded-xl font-medium shadow-md hover:bg-purple-50 hover:shadow-lg transition-all flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-700">{apiError}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-2xl transition-all hover:scale-[1.02]">
            <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}></div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </h3>
                <span className="text-sm font-medium text-slate-600">{stat.change}</span>
              </div>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commission Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg">
        <div className="rounded-2xl bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Percent className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Withdrawal Commission Rate
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <Star className="h-3 w-3" />
                    {commissionInfo?.tierName || 'New'} Tier
                  </span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Your current tier determines the commission rate on withdrawals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {commissionInfo?.rate ?? 30}%
                </p>
                <p className="text-xs text-slate-500 font-medium">Commission</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < (commissionInfo?.starRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">{commissionInfo?.starRating ?? 0}/5 Stars</p>
              </div>
            </div>
          </div>
          
          {/* Commission Tier Breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Commission Rates by Tier</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {(commissionInfo?.tierRates || defaultTierRates).map((t) => (
                <div 
                  key={t.key} 
                  className={`p-2 rounded-xl text-center text-xs transition-all ${
                    commissionInfo?.tierName === t.tier 
                      ? 'bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 ring-2 ring-indigo-200' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < t.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className={`font-bold ${commissionInfo?.tierName === t.tier ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {t.tier}
                  </p>
                  <p className={`font-semibold ${commissionInfo?.tierName === t.tier ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {t.rate}%
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Increase your tier rating to reduce commission fees. Gold tier publishers pay 0% commission!
            </p>
          </div>
        </div>
      </div>

      {/* Payment Information & Withdrawal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Information</h3>
            <p className="text-sm text-slate-600">Manage your payout details</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : paymentDetails ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Mobile Money</h4>
                      <p className="text-xs text-slate-600">Payment Method</p>
                    </div>
                  </div>
                  {paymentDetails.isComplete && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="font-medium text-slate-900">{paymentDetails.registeredName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-slate-600" />
                    <span className="font-medium text-slate-900">{paymentDetails.phoneNumber}</span>
                  </div>
                </div>
              </div>
              
              {!paymentDetails.isComplete && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900">Incomplete Details</p>
                    <p className="text-amber-700">Please update your payment information to enable withdrawals</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
              >
                Update Payment Details
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl border border-slate-200 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-slate-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">No Payment Method</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Add your payment information to receive earnings
                </p>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          )}
          
          <div className="text-sm text-slate-600 space-y-2 p-4 bg-slate-50 rounded-xl mt-4">
            <p><strong className="text-slate-900">Minimum Payout:</strong> GHC 50.00</p>
            <p><strong className="text-slate-900">Payment Schedule:</strong> Upon approval</p>
            <p><strong className="text-slate-900">Processing Time:</strong> 5-7 business days</p>
          </div>
        </div>

        {/* Withdraw Cash */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Withdrawal</h3>
            <p className="text-sm text-slate-600">Withdraw your earnings</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Available Balance</h4>
              <p className="text-3xl font-bold text-slate-900 mb-4">
                GHC {availableBalance.toFixed(2)}
              </p>
              <button 
                onClick={() => setShowWithdrawModal(true)}
                disabled={!paymentDetails?.isComplete || availableBalance <= 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Withdraw Cash
              </button>
              
              {!paymentDetails?.isComplete && (
                <p className="text-xs text-amber-600 mt-3 font-medium">
                  Complete your payment details to enable withdrawals
                </p>
              )}
              {paymentDetails?.isComplete && availableBalance <= 0 && (
                <p className="text-xs text-slate-600 mt-3 font-medium">
                  No withdrawable balance yet
                </p>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">Withdrawal Process</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Ensure payment details are complete</li>
                    <li>Submit withdrawal request</li>
                    <li>Admin reviews your request</li>
                    <li>Receive payment within 5-7 days</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Earning Articles */}
      {!earningsLoading && earnings && earnings.total.articles.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Top Earning Articles
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => {}}
              className="px-4 py-2 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600"
            >
              All Time ({earnings.total.articles.length})
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-600"
            >
              This Month ({earnings.currentMonth.articles.length})
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-600"
            >
              This Week ({earnings.currentWeek.articles.length})
            </button>
          </div>

          {/* Articles Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Article</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Views</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Shares</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Likes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earnings.total.articles.slice(0, 10).map((article) => (
                  <tr key={article.articleId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-800 line-clamp-1">{article.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{article.views}</p>
                        <p className="text-xs text-emerald-600">GHC {article.viewsEarning.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{article.shares}</p>
                        <p className="text-xs text-emerald-600">GHC {article.sharesEarning.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{article.likes}</p>
                        <p className="text-xs text-emerald-600">GHC {article.likesEarning.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
                        GHC {article.totalEarning.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {earnings.total.articles.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No earning articles yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Articles with at least GHC 5.00 in earnings will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Withdrawal History */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Withdrawal History</h3>
          <p className="text-sm text-slate-600">Track your withdrawal requests</p>
        </div>
        
        {withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {new Date(withdrawal.requestDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                      GHC {(Number(withdrawal.amount) || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {withdrawal.adminNotes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No withdrawals yet</h3>
            <p className="text-slate-600">
              Your withdrawal requests will appear here
            </p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Payment Details</h3>
                <p className="text-sm text-slate-600 mt-1">Mobile Money Information</p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setValidationErrors([])
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900 mb-2">Please fix the following errors:</p>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Registered Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={paymentForm.registeredName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, registeredName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    value={paymentForm.phoneNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Ensure the name and phone number match your mobile money account
                </p>
              </div>

              <button
                onClick={handleSavePaymentDetails}
                disabled={processing}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Payment Details'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Request Withdrawal</h3>
                <p className="text-sm text-slate-600 mt-1">Review and submit</p>
              </div>
              <button
                onClick={() => {
                  setShowWithdrawModal(false)
                  setValidationErrors([])
                  setWithdrawAmount('')
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900 mb-2">Cannot process withdrawal:</p>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Withdrawal Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {paymentDetails && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-slate-600" />
                    Payment Details Review
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium text-slate-900">{paymentDetails.registeredName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium text-slate-900">{paymentDetails.phoneNumber || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      {paymentDetails.isComplete ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                          <AlertCircle className="h-4 w-4" />
                          Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Commission Breakdown */}
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-indigo-600" />
                    Commission Breakdown
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                      <Star className="h-3 w-3" />
                      {commissionInfo?.tierName || 'New'} Tier
                    </span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Requested Amount:</span>
                      <span className="font-medium text-slate-900">GHC {parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Commission ({commissionInfo?.rate ?? 30}%):</span>
                      <span className="font-medium">- GHC {calculateCommission(parseFloat(withdrawAmount)).commission.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-indigo-200 flex justify-between text-lg">
                      <span className="font-semibold text-slate-700">You'll Receive:</span>
                      <span className="font-bold text-emerald-600">GHC {calculateCommission(parseFloat(withdrawAmount)).net.toFixed(2)}</span>
                    </div>
                  </div>
                  {(commissionInfo?.rate ?? 30) > 0 && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-700 flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        Increase your tier rating to reduce commission. Gold tier (5★) publishers pay 0% commission!
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleWithdrawRequest}
                disabled={processing || !paymentDetails?.isComplete}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Withdrawal Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
