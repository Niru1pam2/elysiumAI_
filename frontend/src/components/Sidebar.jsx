import {
  Coins,
  LogOutIcon,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../features/createConversation";
import { getConversations } from "../features/getConversations";
import {
  addConversation,
  removeConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { logout } from "../features/logOut";
import { setUser } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";
import { deleteConversation } from "../features/deleteConversation";

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const getConv = async () => {
      const data = await getConversations();
      if (data) {
        dispatch(setConversations(data));
      }
    };

    getConv();
  }, [dispatch, user?._id]);

  const handleCreateConversation = async () => {
    const data = await createConversation();
    if (data) {
      dispatch(addConversation(data));
      dispatch(setSelectedConversation(data));
      setMobileOpen(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await deleteConversation(conversationId);
      if (response) {
        // Filter out deleted chat from Redux
        dispatch(removeConversation(conversationId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSelectConversation = (conversation) => {
    dispatch(setSelectedConversation(conversation));
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      dispatch(setUser(null));
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Dark Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 h-screen shrink-0 bg-[#0d0f14] border-r border-white/10 transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "w-72 lg:w-64"}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 border-b border-white/10 h-16 shrink-0">
            {(!collapsed || mobileOpen) && (
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                <span className="text-base font-semibold text-slate-100 tracking-tight truncate">
                  ElysiumAI_
                </span>
                <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide shrink-0">
                  {user?.plan || "free"}
                </span>
              </div>
            )}

            <div
              className={`flex items-center gap-1 ${
                collapsed ? "w-full justify-center" : "ml-auto"
              }`}
            >
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen size={18} />
                ) : (
                  <PanelLeftClose size={18} />
                )}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="flex lg:hidden items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                title="Close sidebar"
              >
                <X size={18} />
              </button>

              {(!collapsed || mobileOpen) && (
                <button
                  className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={handleCreateConversation}
                  title="New Chat"
                >
                  <PenSquare size={16} />
                </button>
              )}
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3 shrink-0">
            <button
              onClick={handleCreateConversation}
              className={`w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-r from-indigo-500 to-violet-600 rounded-xl py-2.5 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/20 ${
                collapsed && !mobileOpen ? "px-0" : "px-4"
              }`}
              title="New Chat"
            >
              <Plus size={18} />
              {(!collapsed || mobileOpen) && <span>New Chat</span>}
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
            {conversations && conversations.length > 0 ? (
              conversations.map((conversation) => {
                const isActive = selectedConversation?._id === conversation._id;

                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    title={
                      collapsed && !mobileOpen
                        ? conversation.title || "New chat"
                        : undefined
                    }
                    className={`group relative flex items-center h-10 rounded-xl transition-all duration-200 cursor-pointer ${
                      collapsed && !mobileOpen
                        ? "justify-center px-0"
                        : "justify-between px-3"
                    } ${
                      isActive
                        ? "bg-indigo-600/20 border border-indigo-500/30 text-white font-medium shadow-xs"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <MessageSquare
                        size={16}
                        className={`shrink-0 ${
                          isActive ? "text-indigo-400" : "text-slate-400"
                        }`}
                      />
                      {(!collapsed || mobileOpen) && (
                        <span className="truncate text-xs font-medium">
                          {conversation.title || "New chat"}
                        </span>
                      )}
                    </div>

                    {(!collapsed || mobileOpen) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation._id);
                          // Insert delete action handler here
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded-md transition-all shrink-0 cursor-pointer"
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            ) : !collapsed || mobileOpen ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">
                No conversations yet.
              </div>
            ) : null}
          </div>

          {/* User Profile Footer */}
          <div className="mt-auto p-2 border-t border-white/10 bg-[#090b0e] shrink-0">
            <div
              className={`flex items-center rounded-xl transition-colors ${
                collapsed && !mobileOpen
                  ? "flex-col gap-3 py-2 items-center"
                  : "justify-between gap-2 p-2"
              }`}
            >
              <div
                className={`flex items-center gap-3 min-w-0 ${
                  collapsed && !mobileOpen ? "flex-col" : "overflow-hidden"
                }`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User avatar"}
                    className="size-9 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0"
                  />
                ) : (
                  <div className="size-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm ring-1 ring-indigo-400/30 shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                {!collapsed || mobileOpen ? (
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {user?.name || "Guest User"}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="capitalize text-indigo-400 font-medium">
                        {user?.plan || "Free"}
                      </span>
                      <span className="text-white/20">•</span>

                      <button
                        className="flex items-center gap-1 text-amber-400/90 font-medium cursor-pointer hover:text-amber-400 transition-colors"
                        onClick={() => setShowBilling(true)}
                        title="View Credits"
                      >
                        <Coins size={12} />
                        <span>{user?.credits ?? 100}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBilling(true)}
                    className="flex items-center gap-1 text-amber-400 text-xs font-medium hover:bg-white/5 px-1.5 py-0.5 rounded-md transition-colors"
                    title={`${user?.credits ?? 100} credits remaining`}
                  >
                    <Coins size={14} />
                  </button>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                title="Logout"
              >
                <LogOutIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Billing Drawer Modal */}
      {showBilling && (
        <BillingDrawer
          open={showBilling}
          onClose={() => setShowBilling(false)}
        />
      )}
    </>
  );
}
