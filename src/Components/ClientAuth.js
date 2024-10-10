import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Sun, Moon, User, Lock } from 'lucide-react'
import { getStoredTheme, toggleStoredTheme } from '../utils/localStorageUtil'

export function ClientAuth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(getStoredTheme() === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleMode = () => setIsLogin(!isLogin)
  const toggleTheme = () => {
    const newTheme = toggleStoredTheme()
    setIsDarkMode(newTheme === 'dark')
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-orange-50'}`}>
      <div className={`max-w-md w-full space-y-8 p-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-orange-500" />
            <span className="ml-2 text-xl font-bold text-orange-500">PITIA</span>
          </div>
          <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input id="name" name="name" type="text" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'} placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`} placeholder="Name" />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'} placeholder-gray-500 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`} placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 text-gray-900'} placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`} placeholder="Password" />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLogin ? <User className="h-5 w-5 text-orange-500 group-hover:text-orange-400" aria-hidden="true" /> : <Lock className="h-5 w-5 text-orange-500 group-hover:text-orange-400" aria-hidden="true" />}
              </span>
              {isLogin ? 'Sign in' : 'Sign up'}
            </motion.button>
          </div>
        </form>
        <div className="text-center">
          <button onClick={toggleMode} className="font-medium text-orange-600 hover:text-orange-500">
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClientAuth