import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

// ------------------- Types -------------------
interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done";
  assignee: string;
  assignedTo?: string | null;
  dueDate?: Date;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

type AppContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: (username: string, password: string) => void;
  logout: () => void;

  isInitialized: boolean; // ✅ added this line

  teamName: string;
  setTeamName: (name: string) => void;
  teamBio: string;
  setTeamBio: (bio: string) => void;
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  addTeamMember: (member: Omit<TeamMember, "id">) => void;

  currentUser: TeamMember | null;
  setCurrentUser: (user: TeamMember | null) => void;

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  deadline: Date | null;
  setDeadline: (date: Date | null) => void;

  hackathonEndTime: Date | null;
  setHackathonEndTime: (date: Date | null) => void;
  resetHackathonTimer: () => void;
};

const defaultContextValue: AppContextType = {
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  login: () => {},
  logout: () => {},
  isInitialized: false, // ✅ added default value
  teamName: "My Team",
  setTeamName: () => {},
  teamBio: "Our team is participating in a hackathon!",
  setTeamBio: () => {},
  teamMembers: [],
  setTeamMembers: () => {},
  addTeamMember: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  tasks: [],
  setTasks: () => {},
  addTask: () => {},
  updateTask: () => {},
  deadline: null,
  setDeadline: () => {},
  hackathonEndTime: null,
  setHackathonEndTime: () => {},
  resetHackathonTimer: () => {},
};

export const AppContext = createContext<AppContextType>(defaultContextValue);
export const useAppContext = () => useContext(AppContext);

type AppProviderProps = {
  children: ReactNode;
};

// ------------------- Provider -------------------
export const AppProvider = ({ children }: AppProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [teamName, setTeamName] = useState("My Team");
  const [teamBio, setTeamBio] = useState(
    "Our team is participating in a hackathon!"
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design user interface",
      description: "Create wireframes and design system",
      status: "To Do",
      assignee: "You",
    },
    {
      id: "2",
      title: "Set up database",
      description: "Configure MongoDB and create schemas",
      status: "To Do",
      assignee: "You",
    },
    {
      id: "3",
      title: "Implement authentication",
      description: "Add user login and registration",
      status: "To Do",
      assignee: "You",
    },
    {
      id: "4",
      title: "Create landing page",
      description: "Design and implement the landing page",
      status: "To Do",
      assignee: "You",
    },
  ]);

  const [deadline, setDeadline] = useState<Date | null>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const [hackathonEndTime, setHackathonEndTime] = useState<Date | null>(null);

  // ------------------- Initialize Auth from localStorage -------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("isAuthenticated");
      const savedUser = localStorage.getItem("currentUser");

      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }

      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      setIsInitialized(true); // ✅ ensures app waits until localStorage is checked
    }
  }, []);

  // ------------------- Sync Auth State -------------------
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      if (isAuthenticated) {
        localStorage.setItem("isAuthenticated", "true");
      } else {
        localStorage.removeItem("isAuthenticated");
      }
    }
  }, [isAuthenticated, isInitialized]);

  // ------------------- Sync Team & Tasks from Backend -------------------
  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    // 1. Fetch team members
    fetch(`${API_URL}/teams/myteam`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.team) return;

        setTeamName(data.team.name);
        if (data.team.members && Array.isArray(data.team.members)) {
          setTeamMembers(
            data.team.members
              .filter((m: any) => m.user)
              .map((m: any) => ({
                id: m.user._id,
                name: m.user.name,
                role: m.role || "member",
                avatar: `https://placehold.co/40x40/38bdf8/ffffff?text=${(
                  m.user.name || "U"
                )
                  .charAt(0)
                  .toUpperCase()}`,
              }))
          );
        }
      })
      .catch((err) => console.error("Failed to load team:", err));

    // 2. Fetch team tasks
    fetch(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(
            data.map((t: any) => ({
              id: t._id,
              _id: t._id,
              title: t.title,
              description: t.description || "",
              status: t.status || "To Do",
              assignee: t.assignedTo?.name || "Unassigned",
              assignedTo: t.assignedTo?._id || null,
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to load tasks:", err));
  }, [isAuthenticated]);

  // ------------------- Hackathon Timer Persistence -------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEndTime = localStorage.getItem("hackathonEndTime");
      const storedDeadline = localStorage.getItem("projectDeadline");

      if (storedDeadline) {
        const deadlineDate = new Date(storedDeadline);
        setDeadline(deadlineDate);
        setHackathonEndTime(deadlineDate);
      } else if (storedEndTime) {
        setHackathonEndTime(new Date(storedEndTime));
      } else {
        const defaultEndTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
        setHackathonEndTime(defaultEndTime);
        localStorage.setItem("hackathonEndTime", defaultEndTime.toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (hackathonEndTime && typeof window !== "undefined") {
      localStorage.setItem("hackathonEndTime", hackathonEndTime.toISOString());
    }
  }, [hackathonEndTime]);

  // ------------------- Auth Functions -------------------
  const login = (username: string, password: string) => {
    console.log(`Logging in as ${username}`);

    const user = {
      id: `user-${Date.now()}`,
      name: username,
      role: "Team Member",
      avatar: `https://placehold.co/200x200/1e293b/38bdf8?text=${username
        .charAt(0)
        .toUpperCase()}`,
    };

    setCurrentUser(user);
    setIsAuthenticated(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTeamName("My Team");
    setTeamMembers([]);
    setTasks([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // ------------------- Tasks & Team -------------------
  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    const newMember = { ...member, id: `member-${Date.now()}` };
    setTeamMembers((prev) => [...prev, newMember]);
  };

  // ------------------- Deadlines -------------------
  const updateDeadline = (date: Date | null) => {
    setDeadline(date);
    if (date) {
      setHackathonEndTime(date);
      if (typeof window !== "undefined") {
        localStorage.setItem("projectDeadline", date.toISOString());
        localStorage.setItem("hackathonEndTime", date.toISOString());
      }
    }
  };

  const resetHackathonTimer = () => {
    const newEndTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    setHackathonEndTime(newEndTime);
    setDeadline(newEndTime);
    if (typeof window !== "undefined") {
      localStorage.setItem("hackathonEndTime", newEndTime.toISOString());
      localStorage.setItem("projectDeadline", newEndTime.toISOString());
    }
  };

  // ------------------- Context Value -------------------
  const value = {
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    isInitialized, // ✅ added here
    teamName,
    setTeamName,
    teamBio,
    setTeamBio,
    teamMembers,
    setTeamMembers,
    addTeamMember,
    currentUser,
    setCurrentUser,
    tasks,
    setTasks,
    addTask,
    updateTask,
    deadline,
    setDeadline: updateDeadline,
    hackathonEndTime,
    setHackathonEndTime,
    resetHackathonTimer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
