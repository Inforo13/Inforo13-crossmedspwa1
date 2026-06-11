import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  icon: LucideIcon;
  description: string;
}

export const GenericTab: React.FC<Props> = ({ title, icon: Icon, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[3rem] border border-zinc-100 shadow-xl"
    >
      <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-8">
        <Icon size={48} />
      </div>
      <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">{title}</h2>
      <p className="text-zinc-500 max-w-md font-medium leading-relaxed">
        {description}
      </p>
      <button className="mt-12 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
        Começar Agora
      </button>
    </motion.div>
  );
};
