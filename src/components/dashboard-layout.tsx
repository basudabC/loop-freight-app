"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Truck, Users, PlusCircle, LogOut, Bell, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: true,
    },
    ...(session?.user?.role === "TERRITORY_OFFICER"
      ? [
          {
            name: "New Assignment",
            href: "/assignments/new",
            icon: PlusCircle,
            current: false,
          },
          {
            name: "Incoming Trucks",
            href: "/assignments/incoming",
            icon: Bell,
            current: false,
          },
        ]
      : []),
    ...(session?.user?.role === "ADMIN"
      ? [
          {
            name: "User Management",
            href: "/admin/users",
            icon: Users,
            current: false,
          },
        ]
      : []),
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200/60 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Loop Freight</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {/* User Info Section */}
          <div className="px-6 py-5 border-b border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-blue-50/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate mb-0.5">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-600 truncate mb-1">
                  {isAdmin ? "System Administrator" : "Territory Officer"}
                </p>
                {session?.user?.territoryCity && (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100/80 border border-blue-200/50">
                    <p className="text-xs text-blue-700 font-medium truncate">
                      {session.user.territoryCity}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group",
                  item.current
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                    item.current ? "text-white" : "text-gray-500"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Section - Sign Out */}
          <div className="px-4 py-4 border-t border-gray-200/60 bg-gray-50/50">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl py-3 px-4 transition-all duration-200 font-medium"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 h-20 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-between h-full px-6 lg:px-8 max-w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-gray-100 rounded-xl"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </Button>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {session?.user?.role === "ADMIN" ? "Admin Dashboard" : "Territory Dashboard"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Welcome back, {session?.user?.name?.split(' ')[0] || "User"}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Today</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}