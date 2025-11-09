'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield,
  Palette,
  Globe,
  Camera
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    
    alert('Avatar upload functionality will be implemented with user profile API')
    // TODO: Implement avatar upload to backend
  }

  const handleSavePreferences = () => {
    alert('Preferences saved successfully!')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 rounded-2xl bg-white p-4 shadow-lg border border-slate-100">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-md'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Profile Information</h3>
                  <p className="text-sm text-slate-600">Update your personal information</p>
                </div>
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg shadow-purple-500/30">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <button 
                        className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
                        type="button" 
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Camera className="h-4 w-4" />
                        Change Avatar
                      </button>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG or GIF (max. 2MB)
                      </p>
                      {avatarFile && (
                        <button 
                          className="mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                          onClick={handleAvatarUpload}
                        >
                          Upload
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.username}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <button className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <>
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Account Security</h3>
                  <p className="text-sm text-slate-600">Manage your password and security settings</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg border-2 border-red-200">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-slate-600">Irreversible account actions</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Delete Account</h4>
                    <p className="text-sm text-slate-600">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Notification Preferences</h3>
                <p className="text-sm text-slate-600">Choose what you want to be notified about</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Article Comments', description: 'When someone comments on your article' },
                  { label: 'Article Likes', description: 'When someone likes your article' },
                  { label: 'New Followers', description: 'When someone follows you' },
                  { label: 'Article Approved', description: 'When your article is approved by moderators' },
                  { label: 'Article Rejected', description: 'When your article is rejected' },
                  { label: 'Revenue Updates', description: 'Monthly earnings reports' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.label}</h4>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                ))}
                <button className="mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Display Preferences</h3>
                <p className="text-sm text-slate-600">Customize your dashboard experience</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Theme
                  </label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Current theme: {theme}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Language
                  </label>
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Timezone
                  </label>
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                  </select>
                </div>
                <button 
                  onClick={handleSavePreferences}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
