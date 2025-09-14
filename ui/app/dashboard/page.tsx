"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FolderKanban, CheckSquare, LogOut, Edit, Trash2, Plus } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useProjects, useTasks } from "@/hooks/useProjects"
import { Project, Task } from "@/lib/api"
import { toast } from "sonner"

export default function Dashboard() {
  const router = useRouter()
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject } = useProjects()
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(selectedProject)
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showEditProject, setShowEditProject] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Form states
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskPriority, setTaskPriority] = useState("medium")

  // Set first project as selected when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push("/")
      }
    }
  }, [router])

  // Show loading while checking auth
  if (typeof window === 'undefined') {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleButtonAction = async (buttonId: string, action: () => Promise<void> | void) => {
    setLoadingStates((prev) => ({ ...prev, [buttonId]: true }))
    try {
      if (action instanceof Promise) {
        await action
      } else {
        await action()
      }
    } catch (error) {
      // Error handling is done in the hooks with toast
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buttonId]: false }))
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    // POST /user/projects - Create new project
    await handleButtonAction("create-project", async () => {
      const newProject = await createProject(projectTitle, projectDescription)
      setShowNewProject(false)
      setProjectTitle("")
      setProjectDescription("")
      if (newProject) {
        setSelectedProject(newProject.id)
      }
    })
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return
    
    // PUT /user/projects/:id - Update project with project ID
    await handleButtonAction("edit-project", async () => {
      await updateProject(editingProject.id, projectTitle, projectDescription)
      setShowEditProject(false)
      setEditingProject(null)
      setProjectTitle("")
      setProjectDescription("")
    })
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project? This will also delete all tasks.")) {
      await handleButtonAction(`delete-project-${projectId}`, async () => {
        await deleteProject(projectId)
        if (selectedProject === projectId) {
          setSelectedProject(projects.length > 1 ? projects.find(p => p.id !== projectId)?.id || null : null)
        }
      })
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    
    // POST /user/projects/:projectId/tasks - Create new task
    await handleButtonAction("create-task", async () => {
      await createTask(taskTitle, taskDescription)
      setShowNewTask(false)
      setTaskTitle("")
      setTaskDescription("")
      setTaskPriority("medium")
    })
  }

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    
    // PUT /user/projects/:projectId/tasks/:taskId - Update task with project ID and task ID
    await handleButtonAction("edit-task", async () => {
      await updateTask(editingTask.id, taskTitle, taskDescription)
      setShowEditTask(false)
      setEditingTask(null)
      setTaskTitle("")
      setTaskDescription("")
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await handleButtonAction(`delete-task-${taskId}`, async () => {
        await deleteTask(taskId)
      })
    }
  }

  const handleToggleTaskComplete = async (task: Task) => {
    await handleButtonAction(`toggle-${task.id}`, async () => {
      await updateTask(task.id, undefined, undefined, !task.completed)
    })
  }

  const openEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectTitle(project.title)
    setProjectDescription(project.description || "")
    setShowEditProject(true)
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDescription(task.description || "")
    setShowEditTask(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    toast.success('Successfully signed out!')
    router.push("/")
  }

  const currentProject = selectedProject ? projects.find(p => p.id === selectedProject) : null
  const completedTasks = tasks.filter(task => task.completed)
  const inProgressTasks = tasks.filter(task => !task.completed)

  return (
    <div className="flex h-screen bg-black text-white dark">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FolderKanban className="h-6 w-6 text-accent" />
              <h2 className="text-lg font-bold">Keep Track of It</h2>
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
            <h3 className="text-sm font-medium text-gray-400">PROJECTS</h3>
            <span className="text-xs text-gray-500">
              User
            </span>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
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
                      {project.tasks?.filter(t => t.completed).length || 0}/{project.tasks?.length || 0} tasks completed
                    </div>
                  </button>
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    {/* Edit Project Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditProject(project)
                      }}
                      className="p-1 h-6 w-6"
                      title="Edit Project"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      disabled={loadingStates[`delete-project-${project.id}`]}
                      className="p-1 h-6 w-6"
                      title="Delete Project"
                    >
                      {loadingStates[`delete-project-${project.id}`] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Button className="w-full mt-6 bg-transparent" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-gray-800">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new project to your workspace</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input
                    id="project-title"
                    placeholder="Enter project title"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Enter project description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowNewProject(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loadingStates["create-project"]}>
                    {loadingStates["create-project"] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Project Dialog */}
          <Dialog open={showEditProject} onOpenChange={setShowEditProject}>
            <DialogContent className="bg-black border-gray-800">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update your project details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-title">Project Title</Label>
                  <Input
                    id="edit-project-title"
                    placeholder="Enter project title"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-description">Description</Label>
                  <Textarea
                    id="edit-project-description"
                    placeholder="Enter project description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditProject(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loadingStates["edit-project"]}>
                    {loadingStates["edit-project"] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Project"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                  ? currentProject.description || "Manage your project tasks and track progress"
                  : "Choose a project from the sidebar to view its tasks"
                }
              </p>
            </div>
            {selectedProject && (
              <div className="flex gap-2">
                <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
                  <DialogTrigger asChild>
                    <Button>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border-gray-800">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>Add a new task to your project</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Task Title</Label>
                        <Input
                          id="task-title"
                          placeholder="Enter task title"
                          required
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          placeholder="Enter task description"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="text-white placeholder:text-gray-400"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowNewTask(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loadingStates["create-task"]}>
                          {loadingStates["create-task"] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Task"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
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
                    <div className="text-2xl font-bold">{tasks.length}</div>
                    <p className="text-xs text-gray-500">
                      {tasks.length === 1 ? "task" : "tasks"} in this project
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
                      {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% completion rate
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
                    <CardTitle className="text-sm font-medium text-gray-400">Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{projects.length}</div>
                    <p className="text-xs text-gray-500">Total projects</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks Table */}
              <Card className="border-gray-800">
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage and track your project tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No tasks yet. Create your first task to get started!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 border border-gray-800 rounded-lg group"
                        >
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleToggleTaskComplete(task)}
                              disabled={loadingStates[`toggle-${task.id}`]}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                task.completed
                                  ? "bg-green-400 border-green-400"
                                  : "border-gray-600 hover:border-gray-400"
                              }`}
                            >
                              {loadingStates[`toggle-${task.id}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : task.completed ? (
                                <CheckSquare className="h-3 w-3 text-black" />
                              ) : null}
                            </button>
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
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Edit Task Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditTask(task)}
                              title="Edit Task"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={loadingStates[`delete-task-${task.id}`]}
                              title="Delete Task"
                            >
                              {loadingStates[`delete-task-${task.id}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {!selectedProject && projects.length === 0 && !projectsLoading && (
            <div className="text-center py-16">
              <FolderKanban className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to Keep Track of It!</h2>
              <p className="text-gray-400 mb-6">Create your first project to get started with task management.</p>
              <Button onClick={() => setShowNewProject(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          )}

          {/* Edit Task Dialog */}
          <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
            <DialogContent className="bg-black border-gray-800">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>Update your task details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-title">Task Title</Label>
                  <Input
                    id="edit-task-title"
                    placeholder="Enter task title"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-task-description">Description</Label>
                  <Textarea
                    id="edit-task-description"
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditTask(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loadingStates["edit-task"]}>
                    {loadingStates["edit-task"] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Task"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}