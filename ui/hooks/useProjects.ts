"use client"

import { useState, useEffect } from 'react';
import { apiClient, Project, Task } from '@/lib/api';
import { toast } from 'sonner';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjects();
      setProjects(response.projects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (title: string, description?: string) => {
    try {
      const response = await apiClient.createProject(title, description);
      setProjects(prev => [response.project, ...prev]);
      toast.success(response.message);
      return response.project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateProject = async (id: string, title: string, description?: string) => {
    try {
      const response = await apiClient.updateProject(id, title, description);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? response.project : project
        )
      );
      toast.success(response.message);
      return response.project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await apiClient.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      toast.success(response.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectTasks(projectId);
      setTasks(response.tasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description?: string, completed = false) => {
    if (!projectId) return;

    try {
      const response = await apiClient.createTask(projectId, title, description, completed);
      setTasks(prev => [response.task, ...prev]);
      toast.success(response.message);
      return response.task;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateTask = async (taskId: string, title?: string, description?: string, completed?: boolean) => {
    if (!projectId) return;

    try {
      const response = await apiClient.updateTask(projectId, taskId, title, description, completed);
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? response.task : task
        )
      );
      toast.success(response.message);
      return response.task;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!projectId) return;

    try {
      const response = await apiClient.deleteTask(projectId, taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success(response.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
