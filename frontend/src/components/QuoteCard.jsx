import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, Sparkles } from 'lucide-react';

const QuoteCard = ({ quote }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-lg p-6 my-4 border-l-4 border-l-amber-600 relative overflow-hidden group bg-orange-50/50"
        >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg text-amber-700 mt-1 shadow-sm border border-amber-200">
                    <BookOpen size={20} />
                </div>
                <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-amber-800 font-cinzel text-lg font-bold flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-600/70" />
                            Chapter {quote.chapter}, Verse {quote.verse}
                        </h3>
                    </div>

                    <p className="text-xl md:text-2xl text-amber-950 font-cinzel mb-5 leading-relaxed tracking-wide italic font-medium">
                        "{quote.translation}"
                    </p>

                    <div className="text-md text-amber-800/80 font-serif mb-4 opacity-90 tracking-wide font-medium">
                        {quote.sanskrit}
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center text-xs uppercase tracking-widest text-amber-700 hover:text-amber-900 transition-colors gap-2 group-hover:gap-3 font-semibold"
                    >
                        {isOpen ? (
                            <>Hide Wisdom <ChevronUp size={14} /></>
                        ) : (
                            <>Reveal Wisdom <ChevronDown size={14} /></>
                        )}
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 text-amber-900/90 leading-relaxed text-base font-normal border-t border-amber-600/20 mt-3 relative">
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent"></div>
                                    {quote.explanation}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default QuoteCard;
