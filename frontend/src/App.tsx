import React, {
  useState,
  useCallback,
  useEffect,
} from "react";

import Layout from "./components/Layout";
import { ToastContainer } from "./components/ui";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./pages/CampaignDetails";
import Contacts from "./pages/Contacts";
import EmailAccounts from "./pages/EmailAccounts";
import Sequences from "./pages/Sequences";
import ScheduledEmails from "./pages/ScheduledEmails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import type { Page, Toast } from "./types";

import {
  getWorkspaces,
  createWorkspace,
} from "./api/workspace";

interface Workspace {
  id: string;
  name: string;
  slug?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StoredUser {
  id: string;
  email: string;
  name?: string | null;
}

export default function App() {
  const [authenticated, setAuthenticated] =
    useState(() => {
      return Boolean(
        localStorage.getItem(
          "reachinbox_token"
        )
      );
    });

  const [authMode, setAuthMode] = useState<
    "login" | "signup" | "forgot-password"
  >("login");

  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");

  const [activeCampaignId, setActiveCampaignId] =
    useState<string>("1");

  const [userName, setUserName] = useState(
    () => {
      const storedUser =
        localStorage.getItem(
          "reachinbox_user"
        );

      if (storedUser) {
        try {
          const user: StoredUser =
            JSON.parse(storedUser);

          return (
            user.name ||
            user.email ||
            "User"
          );
        } catch {
          return "User";
        }
      }

      return "User";
    }
  );

  const [userEmail, setUserEmail] =
    useState(() => {
      const storedUser =
        localStorage.getItem(
          "reachinbox_user"
        );

      if (storedUser) {
        try {
          const user: StoredUser =
            JSON.parse(storedUser);

          return user.email || "";
        } catch {
          return "";
        }
      }

      return "";
    });

  const [workspace, setWorkspace] =
    useState<Workspace | null>(() => {
      const storedWorkspace =
        localStorage.getItem(
          "reachinbox_workspace"
        );

      if (storedWorkspace) {
        try {
          return JSON.parse(
            storedWorkspace
          );
        } catch {
          return null;
        }
      }

      return null;
    });

  const [toasts, setToasts] =
    useState<Toast[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: Toast["type"] = "success"
    ) => {
      const id = `toast-${Date.now()}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter(
            (toast) =>
              toast.id !== id
          )
        );
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
      );
    },
    []
  );

  const navigate = useCallback(
    (
      page: Page,
      id?: string
    ) => {
      setCurrentPage(page);

      if (id) {
        setActiveCampaignId(id);
      }

      window.scrollTo({
        top: 0,
      });
    },
    []
  );

  /*
   * Load the user's workspace after authentication.
   *
   * If the user already has a workspace:
   *   -> select the first workspace
   *
   * If the user has no workspace:
   *   -> create a default workspace
   *
   * The selected workspace is stored in localStorage
   * so other pages such as Campaigns and CreateCampaign
   * can use it.
   */
  useEffect(() => {
    if (!authenticated) {
      return;
    }

    const loadWorkspace =
      async () => {
        try {
          const workspaces =
            await getWorkspaces();

          if (
            workspaces.length > 0
          ) {
            const selectedWorkspace =
              workspaces[0];

            setWorkspace(
              selectedWorkspace
            );

            localStorage.setItem(
              "reachinbox_workspace",
              JSON.stringify(
                selectedWorkspace
              )
            );

            return;
          }

          /*
           * No workspace exists.
           * Create one automatically.
           */
          const storedUser =
            localStorage.getItem(
              "reachinbox_user"
            );

          let workspaceName =
            "My Workspace";

          if (storedUser) {
            try {
              const user: StoredUser =
                JSON.parse(
                  storedUser
                );

              if (user.name) {
                workspaceName =
                  `${user.name}'s Workspace`;
              }
            } catch {
              // Ignore invalid user data.
            }
          }

          const newWorkspace =
            await createWorkspace(
              workspaceName
            );

          setWorkspace(
            newWorkspace
          );

          localStorage.setItem(
            "reachinbox_workspace",
            JSON.stringify(
              newWorkspace
            )
          );
        } catch (error) {
          console.error(
            "Failed to load/create workspace:",
            error
          );

          /*
           * Do not immediately log the user out.
           * The authentication token is still valid.
           */
        }
      };

    loadWorkspace();
  }, [authenticated]);

  const handleAuth = (
    email: string,
    name: string
  ) => {
    setUserEmail(email);
    setUserName(name);

    setAuthenticated(true);
    setCurrentPage("dashboard");

    addToast(
      `Welcome back, ${
        name.split(" ")[0]
      }!`,
      "success"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "reachinbox_token"
    );

    localStorage.removeItem(
      "reachinbox_user"
    );

    localStorage.removeItem(
      "reachinbox_workspace"
    );

    setAuthenticated(false);

    setAuthMode("login");

    setUserEmail("");
    setUserName("User");

    setWorkspace(null);

    setCurrentPage("dashboard");

    addToast(
      "You have been signed out.",
      "info"
    );
  };

  /*
   * Authentication screen
   */
  if (!authenticated) {
    return (
      <div className="h-full">
        <Auth
          mode={authMode}
          onAuth={handleAuth}
          onSwitchMode={setAuthMode}
        />

        <ToastContainer
          toasts={toasts}
          onDismiss={dismissToast}
        />
      </div>
    );
  }

  /*
   * Main application pages
   */
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={navigate}
            userName={userName}
          />
        );

      case "campaigns":
        return (
          <Campaigns
            onNavigate={navigate}
            onToast={addToast}
          />
        );

      case "create-campaign":
        return (
          <CreateCampaign
            onNavigate={navigate}
            onToast={addToast}
          />
        );

      case "campaign-details":
        return (
          <CampaignDetails
            campaignId={
              activeCampaignId
            }
            onNavigate={navigate}
            onToast={addToast}
          />
        );

      case "contacts":
        return (
          <Contacts
            onToast={addToast}
          />
        );

      case "email-accounts":
        return (
          <EmailAccounts
            onToast={addToast}
          />
        );

      case "sequences":
        return (
          <Sequences
            onToast={addToast}
          />
        );

      case "scheduled-emails":
        return (
          <ScheduledEmails
            onToast={addToast}
          />
        );

      case "analytics":
        return <Analytics />;

      case "settings":
        return (
          <Settings
            onToast={addToast}
          />
        );

      default:
        return (
          <Dashboard
            onNavigate={navigate}
            userName={userName}
          />
        );
    }
  };

  return (
    <div className="h-full">
      <Layout
        currentPage={currentPage}
        onNavigate={navigate}
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
      >
        {renderPage()}
      </Layout>

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}