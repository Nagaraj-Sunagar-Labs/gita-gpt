import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import QuoteCard from './QuoteCard';

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex gap-6 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            <div className={`p-3 rounded-xl h-fit flex-shrink-0 border shadow-lg backdrop-blur-sm ${isUser
                    ? 'bg-amber-100 border-amber-200 text-amber-700'
                    : 'bg-orange-100 border-orange-200 text-orange-600'
                }`}>
                {isUser ? <User size={20} /> : <Sparkles size={20} />}
            </div>

            <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                <div className={`prose prose-p:text-amber-950 prose-strong:text-amber-800 max-w-none p-6 shadow-xl backdrop-blur-md ${isUser
                        ? 'glass-panel rounded-2xl rounded-tr-sm border-amber-200 bg-white/60'
                        : 'glass-panel rounded-2xl rounded-tl-sm border-orange-200 bg-orange-50/70'
                    }`}>
                    {isUser ? (
                        <p className="text-amber-950/90 whitespace-pre-wrap m-0 font-light text-lg leading-relaxed">{message.content}</p>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-amber-950/90 leading-relaxed font-light text-lg tracking-wide">
                                <ReactMarkdown components={{
                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="text-amber-700 font-semibold" {...props} />
                                }}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>

                            {message.quotes && message.quotes.length > 0 && (
                                <div className="mt-8 space-y-6 relative">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30"></div>
                                        <h4 className="text-xs uppercase tracking-[0.2em] text-amber-700/70 font-cinzel font-semibold">Sacred Verses</h4>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30"></div>
                                    </div>

                                    {message.quotes.map((quote, idx) => (
                                        <QuoteCard key={idx} quote={quote} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ChatMessage;
