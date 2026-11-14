import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/router";

export default function Tasks() {
  const router = useRouter();
  const {
    tasks,
    setTasks,
    addTask: addTaskToContext,
    updateTask: updateTaskInContext,
    teamMembers,
    isAuthenticated,
  } = useAppContext();

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<
    "To Do" | "In Progress" | "Done"
  >("To Do");
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced from 500ms to 300ms

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== "undefined") {
      router.replace("/auth");
    }
  }, [isAuthenticated, router, isLoading]);

  // Memoized task filtering for better performance
  const todoTasks = tasks.filter((task) => task.status === "To Do");
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const doneTasks = tasks.filter((task) => task.status === "Done");
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const openAddTaskModal = useCallback(() => {
    setNewTaskTitle("");
    setNewTaskAssignee(teamMembers.length > 0 ? teamMembers[0].name : "");
    setShowAddTaskModal(true);
  }, [teamMembers]);

  const closeAddTaskModal = useCallback(() => {
    setShowAddTaskModal(false);
  }, []);

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle) return;

    addTaskToContext({
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: "",
      assignee: newTaskAssignee,
      status: "To Do",
    });

    closeAddTaskModal();
  }, [newTaskTitle, newTaskAssignee, addTaskToContext, closeAddTaskModal]);

  const openUpdateTaskModal = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setCurrentTaskId(taskId);
        setNewTaskStatus(task.status);
        setShowUpdateTaskModal(true);
      }
    },
    [tasks]
  );

  const closeUpdateTaskModal = useCallback(() => {
    setShowUpdateTaskModal(false);
    setCurrentTaskId(null);
  }, []);

  const handleUpdateTaskStatus = useCallback(() => {
    if (currentTaskId === null) return;
    updateTaskInContext(currentTaskId, { status: newTaskStatus });
    closeUpdateTaskModal();
  }, [currentTaskId, newTaskStatus, updateTaskInContext, closeUpdateTaskModal]);

  const openDeleteTaskModal = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setShowDeleteTaskModal(true);
  }, []);

  const closeDeleteTaskModal = useCallback(() => {
    setShowDeleteTaskModal(false);
    setSelectedTaskId(null);
  }, []);

  const handleDeleteTask = useCallback(() => {
    if (selectedTaskId === null) return;
    setTasks(tasks.filter((task) => task.id !== selectedTaskId));
    closeDeleteTaskModal();
  }, [selectedTaskId, tasks, setTasks, closeDeleteTaskModal]);

  useEffect(() => {
    if (!showDeleteTaskModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDeleteTaskModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteTaskModal, closeDeleteTaskModal]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen dark-theme-background flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-display-md font-display text-gradient-primary mb-2 text-glow">
          Task Board
        </h2>
        <button onClick={openAddTaskModal} className="btn-primary">
          Add New Task
        </button>
      </div>
      <p className="text-body-sm font-body text-zinc-400 mb-6 max-w-3xl">
        This is your team's Kanban board. It provides a clear overview of all
        tasks and their current status. Click the 'Update Status' button on any
        task card to move it to a different column, helping everyone stay
        synchronized on the project's workflow.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do */}
        <div className="card">
          <h3 className="text-heading-lg font-heading mb-4 text-center text-rose-400">
            To Do
          </h3>
          <div className="space-y-4 min-h-[100px]">
            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass rounded-xl p-4 transition-all duration-300"
                >
                  <p className="text-heading-sm font-heading">{task.title}</p>
                  <p className="text-body-sm font-body text-zinc-400 mt-1">
                    Assigned to: {task.assignee}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openUpdateTaskModal(task.id)}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteTaskModal(task.id)}
                      className="text-xs btn-secondary border-red-500/40 py-1 px-3 text-red-300 hover:border-red-400 hover:text-red-200"
                      aria-label={`Delete ${task.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-4">No tasks to do</p>
            )}
          </div>
        </div>
        {/* In Progress */}
        <div className="card">
          <h3 className="text-heading-lg font-heading mb-4 text-center text-amber-400">
            In Progress
          </h3>
          <div className="space-y-4 min-h-[100px]">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass rounded-xl p-4 transition-all duration-300"
                >
                  <p className="text-heading-sm font-heading">{task.title}</p>
                  <p className="text-body-sm font-body text-zinc-400 mt-1">
                    Assigned to: {task.assignee}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openUpdateTaskModal(task.id)}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteTaskModal(task.id)}
                      className="text-xs btn-secondary border-red-500/40 py-1 px-3 text-red-300 hover:border-red-400 hover:text-red-200"
                      aria-label={`Delete ${task.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-4">
                No tasks in progress
              </p>
            )}
          </div>
        </div>
        {/* Done */}
        <div className="card">
          <h3 className="text-heading-lg font-heading mb-4 text-center text-emerald-400">
            Done
          </h3>
          <div className="space-y-4 min-h-[100px]">
            {doneTasks.length > 0 ? (
              doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass rounded-xl p-4 opacity-70 transition-all duration-300"
                >
                  <p className="text-heading-sm font-heading line-through">
                    {task.title}
                  </p>
                  <p className="text-body-sm font-body text-zinc-400 mt-1">
                    Assigned to: {task.assignee}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openUpdateTaskModal(task.id)}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteTaskModal(task.id)}
                      className="text-xs btn-secondary border-red-500/40 py-1 px-3 text-red-300 hover:border-red-400 hover:text-red-200"
                      aria-label={`Delete ${task.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-4">
                No completed tasks
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-lg">
            <h2 className="text-heading-xl font-heading mb-6">Add New Task</h2>
            <div>
              <div className="mb-4">
                <label className="label-enhanced">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input-enhanced w-full"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="label-enhanced">Assign To</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="input-enhanced w-full"
                  required
                >
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeAddTaskModal}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="w-full btn-primary"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Task Status Modal */}
      {showUpdateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-sm">
            <h2 className="text-heading-xl font-heading mb-6">
              Update Task Status
            </h2>
            <div>
              <div className="mb-6">
                <label className="label-enhanced">New Status</label>
                <select
                  value={newTaskStatus}
                  onChange={(e) =>
                    setNewTaskStatus(
                      e.target.value as "To Do" | "In Progress" | "Done"
                    )
                  }
                  className="input-enhanced status-select-enhanced w-full"
                  required
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeUpdateTaskModal}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateTaskStatus}
                  className="w-full btn-primary"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteTaskModal && selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={closeDeleteTaskModal}
        >
          <div
            className="card w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-task-title"
              className="text-heading-xl font-heading mb-4"
            >
              Delete task?
            </h2>
            <p className="text-body-sm font-body text-zinc-300 mb-6">
              Are you sure you want to delete this task? This action cannot be
              undone.
              <span className="block mt-2 font-semibold text-white">
                {selectedTask.title}
              </span>
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeDeleteTaskModal}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
