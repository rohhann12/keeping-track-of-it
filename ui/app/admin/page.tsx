"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FolderKanban, CheckSquare, LogOut, Crown, Users } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Project, Task, User } from "@/lib/api"
import { getRoleFromToken } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminDashboard() {
  const router = useRouter()
  
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(false)

  // Check authentication and admin role on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push("/")
        return
      }
      
      // Decode JWT token to check role
      const role = getRoleFromToken(token)
      if (role !== 'ADMIN') {
        router.push("/dashboard")
        return
      }
    }
  }, [router])

  // Fetch all projects on mount
  useEffect(() => {
    fetchAllProjects()
  }, [])

  // Fetch tasks when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchProjectTasks(selectedProject)
    }
  }, [selectedProject])

  const fetchAllProjects = async () => {
    try {
      setProjectsLoading(true)
      const response = await apiClient.getAllProjects()
      setAllProjects(response.projects)
      
      // Extract unique users from projects
      const uniqueUsers = response.projects.reduce((acc: User[], project: Project) => {
        if (project.user && !acc.find(u => u.id === project.user!.id)) {
          acc.push(project.user)
        }
        return acc
      }, [])
      setUsers(uniqueUsers)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects'
      toast.error(errorMessage)
    } finally {
      setProjectsLoading(false)
    }
  }

  const fetchProjectTasks = async (projectId: string) => {
    try {
      setTasksLoading(true)
      const project = allProjects.find(p => p.id === projectId)
      if (project?.user?.id) {
        const response = await apiClient.getUserProjectTasks(project.user.id, projectId)
        setProjectTasks(response.tasks || [])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks'
      toast.error(errorMessage)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    toast.success('Successfully signed out!')
    router.push("/")
  }

  const currentProject = selectedProject ? allProjects.find(p => p.id === selectedProject) : null
  const completedTasks = projectTasks.filter(task => task.completed)
  const inProgressTasks = projectTasks.filter(task => !task.completed)

  // Show loading while checking auth
  if (typeof window === 'undefined') {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white dark">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h2 className="text-lg font-bold">Admin Panel</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">ALL PROJECTS</h3>
            <span className="text-xs text-gray-500">
              {allProjects.length} projects
            </span>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {allProjects.map((project) => (
                <div key={project.id} className="group relative">
                  <button
                    onClick={() => setSelectedProject(project.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedProject === project.id
                        ? "bg-white text-black"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div className="font-medium pr-16">{project.title}</div>
                    <div className="text-sm opacity-70">
                      by {project.user?.email || 'Unknown User'}
                    </div>
                    <div className="text-xs opacity-50">
                      {project.tasks?.length || 0} tasks
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Users Section */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">USERS</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{user.email}</span>
                  <span className="text-xs text-gray-500">({user.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                {currentProject ? currentProject.title : "Select a Project"}
              </h1>
              <p className="text-gray-400">
                {currentProject 
                  ? `by ${currentProject.user?.email || 'Unknown User'} - ${currentProject.description || 'No description'}`
                  : "Choose a project from the sidebar to view its details"
                }
              </p>
            </div>
          </div>

          {selectedProject && (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectTasks.length}</div>
                    <p className="text-xs text-gray-500">
                      {projectTasks.length === 1 ? "task" : "tasks"} in this project
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
                    <p className="text-xs text-gray-500">
                      {projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0}% completion rate
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{inProgressTasks.length}</div>
                    <p className="text-xs text-gray-500">Active tasks</p>
                  </CardContent>
                </Card>

                <Card className="border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{allProjects.length}</div>
                    <p className="text-xs text-gray-500">Across all users</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks Table */}
              <Card className="border-gray-800">
                <CardHeader>
                  <CardTitle>Project Tasks</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tasks for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : projectTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No tasks found for this project.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projectTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                task.completed
                                  ? "bg-green-400 border-green-400"
                                  : "border-gray-600"
                              }`}
                            >
                              {task.completed && <CheckSquare className="h-3 w-3 text-black" />}
                            </div>
                            <div>
                              <h4 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-400">{task.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Created {new Date(task.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {!selectedProject && allProjects.length === 0 && !projectsLoading && (
            <div className="text-center py-16">
              <Crown className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
              <p className="text-gray-400 mb-6">No projects found in the system.</p>
            </div>
          )}

          {!selectedProject && allProjects.length > 0 && (
            <div className="text-center py-16">
              <FolderKanban className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Select a Project</h2>
              <p className="text-gray-400 mb-6">Choose a project from the sidebar to view its details and tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
