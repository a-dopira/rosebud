import React from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        src="/icons8-rose-96.png"
        alt="Loading"
      />
    </div>
  );
}