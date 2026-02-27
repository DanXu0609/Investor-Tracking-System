import { Investor, EB5_STAGES_TEMPLATE } from "../types/investor";
import { apiUrl } from "./supabase";

const STORAGE_KEY = "eb5_investors";

export const investorStorage = {
  // Get all investors - checks for backend access token first, falls back to localStorage
  getAll: async (accessToken?: string): Promise<Investor[]> => {
    if (accessToken) {
      // Use backend if authenticated
      try {
        const response = await fetch(`${apiUrl}/investors`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.investors || [];
        } else {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = errorText;
          }
          console.error('Failed to fetch investors from backend:', errorData);
          return [];
        }
      } catch (err) {
        console.error('Error fetching investors from backend:', err);
        return [];
      }
    } else {
      // Fallback to localStorage for unauthenticated use
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : getDefaultInvestors();
      } catch {
        return getDefaultInvestors();
      }
    }
  },

  // Save all investors
  save: async (investors: Investor[], accessToken?: string): Promise<void> => {
    if (accessToken) {
      // Save to backend if authenticated
      const response = await fetch(`${apiUrl}/investors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ investors }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save investors to backend:', errorText);
        throw new Error(`Failed to save investors: ${errorText}`);
      }
    } else {
      // Fallback to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(investors));
    }
  },

  add: async (investor: Investor, accessToken?: string): Promise<void> => {
    const investors = await investorStorage.getAll(accessToken);
    investors.push(investor);
    await investorStorage.save(investors, accessToken);
  },

  update: async (id: string, updates: Partial<Investor>, accessToken?: string): Promise<void> => {
    const investors = await investorStorage.getAll(accessToken);
    const index = investors.findIndex((inv) => inv.id === id);
    if (index !== -1) {
      investors[index] = { ...investors[index], ...updates };
      await investorStorage.save(investors, accessToken);
    }
  },

  delete: async (id: string, accessToken?: string): Promise<void> => {
    if (accessToken) {
      // Delete from backend if authenticated
      const response = await fetch(`${apiUrl}/investors/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete investor from backend:', errorText);
        throw new Error(`Failed to delete investor: ${errorText}`);
      }
    } else {
      // Delete from localStorage
      const investors = await investorStorage.getAll();
      const filtered = investors.filter((inv) => inv.id !== id);
      await investorStorage.save(filtered);
    }
  },
};

function getDefaultInvestors(): Investor[] {
  return [
    {
      id: "1",
      name: "Wei Chen",
      email: "wchen@example.com",
      country: "China",
      investmentAmount: 800000,
      dateAdded: "2025-08-15",
      currentStageIndex: 5,
      stages: EB5_STAGES_TEMPLATE.map((stage, idx) => ({
        ...stage,
        completed: idx <= 5,
        completedDate: idx <= 5 ? `2025-${String(9 + idx).padStart(2, "0")}-${String(10 + idx).padStart(2, "0")}` : undefined,
      })),
      notes: "Priority processing requested",
    },
    {
      id: "2",
      name: "Maria Rodriguez",
      email: "mrodriguez@example.com",
      country: "Mexico",
      investmentAmount: 1050000,
      dateAdded: "2025-09-20",
      currentStageIndex: 3,
      stages: EB5_STAGES_TEMPLATE.map((stage, idx) => ({
        ...stage,
        completed: idx <= 3,
        completedDate: idx <= 3 ? `2025-${String(10 + idx).padStart(2, "0")}-${String(5 + idx * 2).padStart(2, "0")}` : undefined,
      })),
      notes: "Large investment portfolio",
    },
    {
      id: "3",
      name: "Raj Patel",
      email: "rpatel@example.com",
      country: "India",
      investmentAmount: 900000,
      dateAdded: "2025-11-01",
      currentStageIndex: 7,
      stages: EB5_STAGES_TEMPLATE.map((stage, idx) => ({
        ...stage,
        completed: idx <= 7,
        completedDate: idx <= 7 ? `2025-${String(11 + Math.floor(idx / 2)).padStart(2, "0")}-${String(3 + idx * 3).padStart(2, "0")}` : undefined,
      })),
      notes: "Family application - spouse and 2 children",
    },
    {
      id: "4",
      name: "Ahmed Al-Rashid",
      email: "aalrashid@example.com",
      country: "UAE",
      investmentAmount: 950000,
      dateAdded: "2025-12-10",
      currentStageIndex: 1,
      stages: EB5_STAGES_TEMPLATE.map((stage, idx) => ({
        ...stage,
        completed: idx <= 1,
        completedDate: idx <= 1 ? `2025-12-${String(15 + idx * 5).padStart(2, "0")}` : undefined,
      })),
      notes: "Needs expedited documentation",
    },
  ];
}