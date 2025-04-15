import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  avatar: string;
  upcomingAppointment?: {
    date: string;
    time: string;
    barber: string;
    service: string;
  };
}

interface Appointment {
  id: string;
  date: Date;
  time: string;
  barber: string;
  service: string;
  status: "upcoming" | "completed" | "cancelled";
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
  savedStyles: any[];
  addSavedStyle: (style: any) => void;
  removeSavedStyle: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>({
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    upcomingAppointment: {
      date: "May 15, 2023",
      time: "2:30 PM",
      barber: "Mike Johnson",
      service: "Haircut & Beard Trim",
    },
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    // Try to load appointments from localStorage
    try {
      const savedAppointments = localStorage.getItem("appointments");
      if (savedAppointments) {
        const parsed = JSON.parse(savedAppointments);
        // Ensure dates are properly converted back to Date objects
        return parsed.map((app: any) => ({
          ...app,
          date: app.date instanceof Date ? app.date : new Date(app.date),
        }));
      }
    } catch (error) {
      console.error("Error loading appointments from localStorage:", error);
    }

    // Default appointment if none found in localStorage
    return [
      {
        id: "1",
        date: new Date(2023, 4, 15),
        time: "2:30 PM",
        barber: "Mike Johnson",
        service: "Haircut & Beard Trim",
        status: "upcoming",
      },
    ];
  });

  const [savedStyles, setSavedStyles] = useState<any[]>([]);

  const addAppointment = (appointment: Appointment) => {
    // Check if this appointment already exists
    const existingIndex = appointments.findIndex(
      (app) => app.id === appointment.id,
    );

    if (existingIndex >= 0) {
      // Update existing appointment
      const updatedAppointments = [...appointments];
      updatedAppointments[existingIndex] = appointment;
      setAppointments(updatedAppointments);
    } else {
      // Add new appointment
      setAppointments([...appointments, appointment]);
    }

    // Sync with localStorage
    try {
      localStorage.setItem(
        "appointments",
        JSON.stringify([...appointments, appointment]),
      );
    } catch (error) {
      console.error("Error saving appointments to localStorage:", error);
    }
  };

  const cancelAppointment = (id: string) => {
    const updatedAppointments = appointments.map((app) =>
      app.id === id ? { ...app, status: "cancelled" as const } : app,
    );

    setAppointments(updatedAppointments);

    // Sync with localStorage
    try {
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    } catch (error) {
      console.error("Error saving appointments to localStorage:", error);
    }
  };

  const addSavedStyle = (style: any) => {
    setSavedStyles([...savedStyles, style]);
  };

  const removeSavedStyle = (id: string) => {
    setSavedStyles(savedStyles.filter((style) => style.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        appointments,
        addAppointment,
        cancelAppointment,
        savedStyles,
        addSavedStyle,
        removeSavedStyle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Define the hook before the provider to fix Fast Refresh compatibility
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
