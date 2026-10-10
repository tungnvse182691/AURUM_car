import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import { useShopStore } from "../stores/useShopStore";

/** Floating bar appears when user adds cars to compare */
export default function CompareBar() {
  const { compare, toggleCompare, clearCompare } = useShopStore();

  return (
    <AnimatePresence>
      {compare.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        >
          <div className="flex items-center gap-4 border border-gold/40 bg-obsidian/90 py-3 pl-5 pr-3 shadow-2xl shadow-black/60 backdrop-blur-xl">
            <span className="flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              <Scale size={15} /> {compare.length}/3
            </span>
            <div className="flex gap-2">
              {compare.map((id, i) => (
                <span key={id} className="flex h-8 items-center gap-1.5 bg-gold/15 px-2.5 font-condensed text-xs text-gold">
                  {String(i + 1).padStart(2, "0")}
                  <button onClick={() => toggleCompare(id)} className="hover:text-ivory" aria-label="Xóa khỏi so sánh">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <Link
              to="/compare"
              className="flex items-center gap-2 bg-gold px-5 py-2.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-obsidian hover:bg-champagne"
            >
              So sánh <ArrowRight size={14} />
            </Link>
            <button onClick={clearCompare} className="pr-1 text-ash hover:text-ivory" aria-label="Xóa tất cả">
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
