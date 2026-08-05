import {
  Coins,
  LogOutIcon,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PenSquare,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../features/createConversation";
import { getConversations } from "../features/getConversations";
import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { logout } from "../features/logOut";
import { setUser } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";

export default function Sidebar() {
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
      dispatch(setConversations(data));
    };

    getConv();
  }, [dispatch, user?._id]);

  const handleCreateConversation = async () => {
    const data = await createConversation();
    if (data) {
      dispatch(addConversation(data));
      dispatch(setSelectedConversation(data)); // Auto-select newly created chat
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      dispatch(setUser(null));
    }
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 h-screen shrink-0 bg-[#0d0f14] border-r border-white/6 transition-all duration-300 ease-in-out ${
        collapsed ? "w-18" : "w-67.5"
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/6 h-15">
          {!collapsed && (
            <>
              <span className="text-[16px] font-semibold text-slate-100 tracking-tight truncate">
                ElysiumAI_
              </span>
              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide shrink-0">
                free
              </span>
            </>
          )}

          <div className="flex items-center gap-1.5 mx-auto lg:mx-0">
            {/* Collapse Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            {/* Quick New Chat Icon (Expanded mode) */}
            {!collapsed && (
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

        {/* New Chat Action */}
        <div className="p-3">
          {collapsed ? (
            <button
              onClick={handleCreateConversation}
              className="w-full flex items-center justify-center p-2.5 text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleCreateConversation}
            >
              <Plus size={16} />
              New Chat
            </button>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {conversations?.map((conversation) => {
            const isActive = selectedConversation?._id === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => dispatch(setSelectedConversation(conversation))}
                title={collapsed ? conversation.title || "New chat" : undefined}
                className={`group flex items-center ${
                  collapsed ? "justify-center p-2" : "justify-between p-2"
                } rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600/25 border border-indigo-500/30 text-white font-medium "
                    : "text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-200"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <MessageSquare size={16} className="shrink-0" />
                  {!collapsed && (
                    <span className="truncate text-sm font-medium">
                      {conversation.title || "New chat"}
                    </span>
                  )}
                </div>

                {!collapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Delete action hook
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-white/40 transition-opacity shrink-0"
                    title="Delete conversation"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto p-2 border-t border-white/6 bg-[#090b0e]">
          <div
            className={`flex items-center ${
              collapsed ? "flex-col gap-3 p-1.5" : "justify-between gap-2 p-2"
            } rounded-xl hover:bg-indigo-500/10 transition-colors group`}
          >
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              {/* Avatar / Fallback Initials */}
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

              {/* Extended User Info (Expanded Mode Only) */}
              {!collapsed && (
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {user?.name || "Guest User"}
                  </span>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="capitalize text-indigo-400 font-medium">
                      {user?.plan || "Free"} Plan
                    </span>
                    <span className="text-white/20">•</span>

                    <button
                      className="flex items-center gap-1 text-amber-400/90 font-medium cursor-pointer hover:text-amber-400 transition-colors"
                      onClick={() => setShowBilling(true)}
                    >
                      <Coins size={14} />
                      <span>{user?.credits ?? 100}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOutIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {showBilling && (
        <BillingDrawer
          open={showBilling}
          onClose={() => setShowBilling(false)}
        />
      )}
    </aside>
  );
}
