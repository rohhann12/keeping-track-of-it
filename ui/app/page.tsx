"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, FolderKanban, Users, BarChart3, Clock, Target, Shield, Zap, Star, Award } from "lucide-react"
import { toast } from "sonner"

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check if user is already authenticated
  if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
    router.push("/dashboard")
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await apiClient.signin(loginEmail, loginPassword)
      
      // Store token in localStorage
      localStorage.setItem('auth_token', response.token)
      console.log(response.token)
      router.push("/dashboard")
      toast.success('Successfully signed in!')
      setShowAuth(false)
      setLoginEmail("")
      setLoginPassword("")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await apiClient.signup(signupEmail, signupPassword)
      
      // Store token in localStorage
      localStorage.setItem('auth_token', response.token)
      
      toast.success('Account created successfully!')
      setShowAuth(false)
      setSignupEmail("")
      setSignupPassword("")
      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const navigateToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black text-white dark">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderKanban className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold">Keep Track of It</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={showAuth} onOpenChange={setShowAuth}>
              <DialogTrigger asChild>
                <Button variant="outline">Sign In</Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-gray-800">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <DialogHeader>
                      <DialogTitle>Welcome Back</DialogTitle>
                      <DialogDescription>Enter your credentials to access your dashboard</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="text-white placeholder:text-gray-400"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <DialogHeader>
                      <DialogTitle>Create Account</DialogTitle>
                      <DialogDescription>Get started with your new project management account</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSignup} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="text-white placeholder:text-gray-400"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            <Button onClick={navigateToDashboard}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Project Management
            <span className="text-accent"> Simplified</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto text-pretty">
            Keep track of everything that matters. Streamline your workflow with our powerful project management tool.
            Organize tasks, collaborate with teams, and deliver projects on time.
          </p>
          <Button size="lg" className="mr-4" onClick={navigateToDashboard}>
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Everything You Need</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to help you manage projects efficiently and keep your team aligned.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <FolderKanban className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Project Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Keep all your projects organized in one place with intuitive navigation and smart categorization.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Users className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Work together seamlessly with role-based access, real-time updates, and integrated communication.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Monitor project progress with detailed analytics, reporting, and customizable dashboards.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Clock className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Time Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Track time spent on tasks, set deadlines, and get automated reminders to stay on schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Target className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Goal Setting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Set clear objectives, track milestones, and measure success with comprehensive goal management.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <Shield className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Enterprise-grade security with data encryption, secure access controls, and privacy compliance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose Keep Track of It?</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of teams who have transformed their project management workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <Zap className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Lightning Fast</h4>
                    <p className="text-gray-400">
                      Built for speed with instant loading and real-time updates across all devices.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Star className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Intuitive Design</h4>
                    <p className="text-gray-400">Clean, modern interface that your team will love to use every day.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Award className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Award Winning</h4>
                    <p className="text-gray-400">Recognized by industry leaders for innovation and user experience.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black rounded-lg p-8 border border-gray-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">99.9%</div>
                <p className="text-gray-400 mb-6">Uptime Guarantee</p>
                <div className="text-4xl font-bold text-accent mb-2">50K+</div>
                <p className="text-gray-400 mb-6">Active Users</p>
                <div className="text-4xl font-bold text-accent mb-2">24/7</div>
                <p className="text-gray-400">Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h3 className="text-4xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using Keep Track of It to manage their projects more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={navigateToDashboard}>
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderKanban className="h-6 w-6 text-accent" />
              <span className="font-semibold">Keep Track of It</span>
            </div>
            <p className="text-gray-500">© 2024 Keep Track of It. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
