"use client"

import type React from "react"
import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FolderKanban, CheckSquare } from "lucide-react"

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState("project-1")
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)

  const projects = [
    { id: "project-1", name: "Website Redesign", tasks: 12, completed: 8 },
    { id: "project-2", name: "Mobile App", tasks: 18, completed: 5 },
    { id: "project-3", name: "Marketing Campaign", tasks: 8, completed: 6 },
  ]

  const tasks = [
    { id: 1, title: "Design homepage mockup", status: "completed", priority: "high", assignee: "John Doe" },
    { id: 2, title: "Implement user authentication", status: "in-progress", priority: "high", assignee: "Jane Smith" },
    { id: 3, title: "Create API documentation", status: "todo", priority: "medium", assignee: "Mike Johnson" },
    { id: 4, title: "Set up deployment pipeline", status: "todo", priority: "low", assignee: "Sarah Wilson" },
    { id: 5, title: "Write unit tests", status: "in-progress", priority: "medium", assignee: "John Doe" },
  ]

  const handleButtonAction = async (buttonId: string, action: () => Promise<void> | void) => {
    setLoadingStates((prev) => ({ ...prev, [buttonId]: true }))
    try {
      if (action instanceof Promise) {
        await action
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        action()
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buttonId]: false }))
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleButtonAction("create-project", () => {
      setShowNewProject(false)
      // Add project logic here
    })
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleButtonAction("create-task", () => {
      setShowNewTask(false)
      // Add task logic here
    })
  }

  return (
    <div className="flex h-screen bg-black text-white dark">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FolderKanban className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-bold">Keep Track of It</h2>
          </div>
          <h3 className="text-sm font-medium text-gray-400 mb-4">PROJECTS</h3>
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedProject === project.id
                    ? "bg-accent text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <div className="font-medium">{project.name}</div>
                <div className="text-sm opacity-70">
                  {project.completed}/{project.tasks} tasks completed
                </div>
              </button>
            ))}
          </div>

          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Button className="w-full mt-6 bg-transparent" variant="outline">
                <FolderKanban className="mr-2 h-4 w-4" />
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
                    className="text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Enter project description"
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{projects.find((p) => p.id === selectedProject)?.name}</h1>
              <p className="text-gray-400">Manage your project tasks and track progress</p>
            </div>
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
                      <Label htmlFor="task-description">Task Description</Label>
                      <Textarea
                        id="task-description"
                        placeholder="Enter task description"
                        required
                        className="text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
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
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-gray-500">+2 from last week</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">18</div>
                <p className="text-xs text-gray-500">75% completion rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">4</div>
                <p className="text-xs text-gray-500">Active tasks</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">2</div>
                <p className="text-xs text-gray-500">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription className="text-gray-400">Manage and track your project tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-400"
                            : task.status === "in-progress"
                              ? "bg-accent"
                              : "bg-gray-600"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-400">Assigned to {task.assignee}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === "high"
                            ? "bg-red-900 text-red-300"
                            : task.priority === "medium"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleButtonAction(`edit-${task.id}`, () => {})}
                        disabled={loadingStates[`edit-${task.id}`]}
                      >
                        {loadingStates[`edit-${task.id}`] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Edit"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
