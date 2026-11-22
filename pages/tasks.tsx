import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/router";
import { Plus, CheckCircle2, Clock, AlertCircle, RefreshCw, Trash2 } from "lucide-react";

export default function Tasks() {
  const router = useRouter();
  const {
    tasks,
    addTask: addTaskToContext,
    updateTask: updateTaskInContext,
    deleteTask: deleteTaskFromContext,
    fetchTasks,
    tasksLoading,
    teamMembers,
    isAuthenticated,
  } = useAppContext();

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);

  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<
    "To Do" | "In Progress" | "Done"
  >("To Do");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== "undefined") {
      router.replace("/auth");
    }
  }, [isAuthenticated, router, isLoading]);

  // Memoized task filtering
  const todoTasks = tasks.filter((task) => task.status === "To Do");
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const doneTasks = tasks.filter((task) => task.status === "Done");
  const selectedTask = tasks.find(
    (task) => task.id === selectedTaskId || task._id === selectedTaskId
  );

  const openAddTaskModal = useCallback(() => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee(teamMembers.length > 0 ? teamMembers[0].name : "You");
    setFormError(null);
    setShowAddTaskModal(true);
  }, [teamMembers]);

  const closeAddTaskModal = useCallback(() => {
    setShowAddTaskModal(false);
    setFormError(null);
  }, []);

  const handleAddTask = useCallback(async () => {
    if (!newTaskTitle.trim()) {
      setFormError("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const matchedMember = teamMembers.find(
        (m) => m.name.toLowerCase() === newTaskAssignee.toLowerCase()
      );

      await addTaskToContext({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        assignee: newTaskAssignee || "Unassigned",
        assignedTo: matchedMember ? matchedMember.id : undefined,
        status: "To Do",
      });

      closeAddTaskModal();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create task"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    newTaskTitle,
    newTaskDescription,
    newTaskAssignee,
    teamMembers,
    addTaskToContext,
    closeAddTaskModal,
  ]);

  const openUpdateTaskModal = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId || t._id === taskId);
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

  const handleUpdateTaskStatus = useCallback(async () => {
    if (!currentTaskId) return;

    setIsSubmitting(true);
    try {
      await updateTaskInContext(currentTaskId, { status: newTaskStatus });
      closeUpdateTaskModal();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTaskId, newTaskStatus, updateTaskInContext, closeUpdateTaskModal]);

  const openDeleteTaskModal = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setShowDeleteTaskModal(true);
  }, []);

  const closeDeleteTaskModal = useCallback(() => {
    setShowDeleteTaskModal(false);
    setSelectedTaskId(null);
  }, []);

  const handleDeleteTask = useCallback(async () => {
    if (!selectedTaskId) return;

    setIsSubmitting(true);
    try {
      await deleteTaskFromContext(selectedTaskId);
      closeDeleteTaskModal();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTaskId, deleteTaskFromContext, closeDeleteTaskModal]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-display-md font-display text-gradient-primary mb-1 text-glow">
            Team Task Board
          </h2>
          <p className="text-body-sm font-body text-zinc-400 max-w-2xl">
            Real-time collaborative task board isolated for your hackathon team.
            Track tasks across To Do, In Progress, and Done.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTasks()}
            disabled={tasksLoading}
            className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
            title="Refresh Tasks"
          >
            <RefreshCw
              className={`w-4 h-4 ${tasksLoading ? "animate-spin text-cyan-400" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddTaskModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="card border-t-4 border-rose-500/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-lg font-heading text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>To Do</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300">
              {todoTasks.length}
            </span>
          </div>
          <div className="space-y-4 min-h-[160px]">
            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <div
                  key={task.id || task._id}
                  className="glass rounded-xl p-4 transition-all duration-300 hover:border-rose-500/40"
                >
                  <p className="text-heading-sm font-heading text-white">{task.title}</p>
                  {task.description ? (
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                    <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-300">
                      👤 {task.assignee}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => openUpdateTaskModal(task.id || task._id || "")}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteTaskModal(task.id || task._id || "")}
                      className="text-xs btn-secondary border-red-500/40 py-1 px-2.5 text-red-300 hover:border-red-400 hover:text-red-200"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-400">No tasks to do</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Click 'Add New Task' to plan your next sprint item.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="card border-t-4 border-amber-500/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-lg font-heading text-amber-400 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>In Progress</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300">
              {inProgressTasks.length}
            </span>
          </div>
          <div className="space-y-4 min-h-[160px]">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => (
                <div
                  key={task.id || task._id}
                  className="glass rounded-xl p-4 transition-all duration-300 hover:border-amber-500/40"
                >
                  <p className="text-heading-sm font-heading text-white">{task.title}</p>
                  {task.description ? (
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                    <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-amber-200">
                      👤 {task.assignee}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => openUpdateTaskModal(task.id || task._id || "")}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteTaskModal(task.id || task._id || "")}
                      className="text-xs btn-secondary border-red-500/40 py-1 px-2.5 text-red-300 hover:border-red-400 hover:text-red-200"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-400">No active tasks</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Move a task here when you start working on it.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="card border-t-4 border-emerald-500/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-lg font-heading text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Done</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-4 min-h-[160px]">
            {doneTasks.length > 0 ? (
              doneTasks.map((task) => (
                <div
                  key={task.id || task._id}
                  className="glass rounded-xl p-4 opacity-80 hover:opacity-100 transition-all duration-300 hover:border-emerald-500/40"
                >
                  <p className="text-heading-sm font-heading line-through text-zinc-300">
                    {task.title}
                  </p>
                  {task.description ? (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                    <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-emerald-300">
                      ✓ {task.assignee}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => openUpdateTaskModal(task.id || task._id || "")}
                      className="text-xs btn-secondary py-1 px-3"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => openDeleteTaskModal(task.id || task._id || "")}
                      className="text-xs btn-secondary border-red-500/40 py-1 px-2.5 text-red-300 hover:border-red-400 hover:text-red-200"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-400">No completed tasks yet</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Completed milestones will display here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg border border-purple-500/30">
            <h2 className="text-heading-xl font-heading mb-4 text-white">Add New Task</h2>

            {formError ? (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-sm text-red-300">
                {formError}
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTask();
              }}
              className="space-y-4"
            >
              <div>
                <label className="label-enhanced">Task Title *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Build responsive navbar"
                  className="input-enhanced w-full text-white placeholder-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="label-enhanced">Description (optional)</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task specifications or acceptance criteria"
                  rows={2}
                  className="input-enhanced w-full text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="label-enhanced">Assign To</label>
                {teamMembers.length > 0 ? (
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="input-enhanced w-full bg-zinc-900 text-white"
                  >
                    {teamMembers.map((member) => (
                      <option
                        key={member.id}
                        value={member.name}
                        className="bg-zinc-900 text-white"
                      >
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="Enter assignee name"
                    className="input-enhanced w-full text-white placeholder-zinc-500"
                  />
                )}
              </div>

              <div className="flex gap-4 pt-3">
                <button
                  type="button"
                  onClick={closeAddTaskModal}
                  disabled={isSubmitting}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Add Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Task Status Modal (Fixes dropdown contrast bug #12) */}
      {showUpdateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-sm border border-purple-500/30">
            <h2 className="text-heading-xl font-heading mb-4 text-white">
              Update Task Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-enhanced mb-2 block">New Status</label>
                {/* Fixed dropdown contrast with bg-zinc-900 and text-white */}
                <select
                  value={newTaskStatus}
                  onChange={(e) =>
                    setNewTaskStatus(
                      e.target.value as "To Do" | "In Progress" | "Done"
                    )
                  }
                  className="input-enhanced w-full bg-zinc-900 text-white border-zinc-700 focus:border-cyan-400"
                  required
                >
                  <option value="To Do" className="bg-zinc-900 text-white py-2">
                    To Do
                  </option>
                  <option value="In Progress" className="bg-zinc-900 text-white py-2">
                    In Progress
                  </option>
                  <option value="Done" className="bg-zinc-900 text-white py-2">
                    Done
                  </option>
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeUpdateTaskModal}
                  disabled={isSubmitting}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateTaskStatus}
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteTaskModal && selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/70 backdrop-blur-sm"
          onClick={closeDeleteTaskModal}
        >
          <div
            className="card w-full max-w-md border border-red-500/30"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-task-title"
              className="text-heading-xl font-heading mb-3 text-red-400 flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Task?
            </h2>
            <p className="text-body-sm font-body text-zinc-300 mb-6">
              Are you sure you want to delete this task? This action cannot be
              undone.
              <span className="block mt-2 font-semibold text-white bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-700">
                {selectedTask.title}
              </span>
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeDeleteTaskModal}
                disabled={isSubmitting}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
