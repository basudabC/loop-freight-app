"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Truck, Package, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showLogin, setShowLogin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Package,
      title: "Book Freight",
      description: "Easily book truckload freight with real-time availability"
    },
    {
      icon: MapPin,
      title: "Track Shipments",
      description: "Monitor your shipments in real-time from pickup to delivery"
    },
    {
      icon: Clock,
      title: "Faster Payments",
      description: "Get paid faster with streamlined payment processing"
    },
    {
      icon: Truck,
      title: "Reduce Deadhead",
      description: "Carriers choose loads closest to them, reducing empty miles"
    }
  ]

  const benefits = [
    "Real-time tracking and visibility",
    "Streamlined booking process",
    "Competitive pricing",
    "24/7 customer support",
    "Advanced route optimization",
    "Secure payment processing"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loop Freight</h1>
                <p className="text-xs text-gray-600">Logistics Management System</p>
              </div>
            </div>
            {!showLogin && (
              <Button 
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Landing Content */}
            <div className={`space-y-8 ${showLogin ? 'hidden lg:block' : ''}`}>
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                    Technology-Enabled Logistics
                  </span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Transform Your Logistics with Loop Freight
                </h2>
                <p className="text-xl text-gray-600">
                  Book, track, and pay for truckload freight shipments with our innovative logistics platform
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-6 pt-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Benefits List */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Why Choose Loop Freight?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!showLogin && (
                <div className="flex items-center space-x-4 pt-4">
                  <Button 
                    size="lg"
                    onClick={() => setShowLogin(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-base"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-sm text-gray-600">
                    Streamline your freight operations today
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Login Form */}
            <div className={`${!showLogin ? 'hidden lg:block' : ''}`}>
              <Card className="w-full shadow-xl border-0">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                  <CardDescription className="text-base">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e as any)
                        }
                      }}
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <Button 
                    onClick={handleSubmit}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        New to Loop Freight?
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-2"
                    onClick={() => window.open('https://loopfreight.io', '_blank')}
                  >
                    Learn More About Our Services
                  </Button>
                </CardContent>
              </Card>

              {showLogin && (
                <button
                  onClick={() => setShowLogin(false)}
                  className="lg:hidden mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center w-full"
                >
                  ← Back to overview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © 2025 Loop Freight. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}