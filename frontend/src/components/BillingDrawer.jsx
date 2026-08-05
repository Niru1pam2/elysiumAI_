import { X, Crown, Zap, Check, Coins } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { createOrder } from "../features/createOrder";
import { verifyPayment } from "../features/verifyPayment";

// Client-side paid plan definitions
const PAID_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    amount: 199,
    credits: 500,
    description: "Perfect for regular creation and productivity.",
    features: [
      "500 Credits",
      "Priority execution",
      "Fast PDF & PPT generation",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    amount: 499,
    credits: 1500,
    description: "Built for power users and heavy workflows.",
    features: [
      "1,500 Credits",
      "Unlimited image generation",
      "Priority server allocation",
      "Dedicated support",
    ],
  },
};

export default function BillingDrawer({ open, onClose }) {
  const { user } = useSelector((state) => state.user);

  const currentPlanId = user?.plan?.toLowerCase() || "free";
  const userCredits = user?.credits ?? 0;

  // Fallback credit allocation check (handles Free tier default of 100)
  const totalCredits =
    user?.totalCredits || PAID_PLANS[currentPlanId]?.credits || 100;

  const creditPercentage = Math.min(
    Math.max((userCredits / totalCredits) * 100, 0),
    100,
  );

  const handleUpgradeClick = async (plan) => {
    try {
      const data = await createOrder(plan);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Elysium AI",
        description: `Upgrade to ${data.plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await verifyPayment(response);
          } catch (error) {
            console.error("Payment verification failed:", error);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Order creation failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transform-gpu"
            onClick={onClose}
          />

          {/* Drawer Content Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-[#0d0f14] border-l border-white/10 shadow-2xl flex flex-col transform-gpu"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Coins size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">
                    Billing & Subscriptions
                  </h2>
                  <p className="text-xs font-medium text-slate-400">
                    Manage your credits and upgrade plan
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
              {/* CURRENT USAGE CARD */}
              <div className="rounded-2xl bg-linear-to-b from-white/5 to-white/2 border border-white/10 p-4.5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Current Balance
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">
                    <Crown size={13} />
                    <span className="capitalize">{currentPlanId} Plan</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {userCredits.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      / {totalCredits.toLocaleString()} Credits
                    </span>
                  </div>
                  <span className="text-xs font-medium text-indigo-400">
                    {Math.round(creditPercentage)}% Remaining
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${creditPercentage}%` }}
                  />
                </div>
              </div>

              {/* AVAILABLE PLANS SECTION */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Select a Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upgrade to get more credits for image, PDF, and slide
                    generation.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {Object.values(PAID_PLANS).map((plan) => {
                    const isCurrent = currentPlanId === plan.id;
                    const isPopular = plan.id === "starter";

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl border p-4.5 transition-all ${
                          isCurrent
                            ? "bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                            : isPopular
                              ? "bg-white/5 border-indigo-500/30 hover:border-indigo-500/60"
                              : "bg-white/3 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {/* Most Popular Badge */}
                        {isPopular && !isCurrent && (
                          <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 rounded-full shadow-sm">
                            Most Popular
                          </span>
                        )}

                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-white">
                              {plan.name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {plan.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-white">
                              ₹{plan.amount}
                            </span>
                            <span className="text-xs text-slate-400"> /mo</span>
                          </div>
                        </div>

                        {/* Features List */}
                        <ul className="mt-3.5 space-y-1.5 border-t border-white/5 pt-3">
                          {plan.features.map((feat, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs text-slate-300"
                            >
                              <Check
                                size={13}
                                className="text-emerald-400 shrink-0"
                              />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Action Button */}
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleUpgradeClick(plan.id)}
                          className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? "bg-white/10 text-slate-400 cursor-not-allowed border border-white/5"
                              : isPopular
                                ? "bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20"
                                : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                          }`}
                        >
                          {isCurrent ? (
                            "Current Active Plan"
                          ) : (
                            <>
                              <Zap size={13} />
                              <span>Upgrade to {plan.name}</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
