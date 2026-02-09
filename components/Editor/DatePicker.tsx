
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, HelpCircle, Check, X } from 'lucide-react';

interface DatePickerProps {
    initialDate?: string; // Format: YYYY-MM-DD
    initialRemindOption?: string;
    onSave: (date: string, remindOption: string) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DatePicker: React.FC<DatePickerProps> = ({ initialDate, initialRemindOption, onSave, onClose, position }) => {
    // Parse initial date or default to today
    const now = new Date();
    const [currentDate, setCurrentDate] = useState(() => initialDate ? new Date(initialDate) : now);
    const [viewDate, setViewDate] = useState(() => new Date(currentDate)); // For navigating months
    const [remindOption, setRemindOption] = useState(initialRemindOption || 'None');
    const [showRemindMenu, setShowRemindMenu] = useState(false);
    const [includeTime, setIncludeTime] = useState(false);

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = currentDate.getDate() === d && currentDate.getMonth() === month && currentDate.getFullYear() === year;
            const isToday = now.getDate() === d && now.getMonth() === month && now.getFullYear() === year;

            days.push(
                <button
                    key={d}
                    onClick={() => {
                        const newDate = new Date(year, month, d);
                        setCurrentDate(newDate);
                        // Auto save on click if not dealing with complex time
                        // Keeping it open for remind selection though
                    }}
                    className={`h-8 w-8 text-xs rounded-full flex items-center justify-center hover:bg-notion-hover dark:hover:bg-gray-700 transition-colors
                        ${isSelected ? 'bg-notion-blue text-white hover:bg-notion-blue dark:bg-notion-blue' : ''}
                        ${isToday && !isSelected ? 'text-notion-blue font-bold' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const handleRemindSelect = (option: string) => {
        setRemindOption(option);
        setShowRemindMenu(false);
    };

    const handleSave = () => {
        onSave(currentDate.toLocaleDateString(), remindOption);
        onClose();
    };

    // Calculate position to keep in viewport (basic logic)
    const style = {
        top: position.top + 10,
        left: position.left,
    };

    if (showRemindMenu) {
        return (
            <div className="fixed inset-0 z-50" onClick={onClose}>
                 <div 
                    className="absolute bg-white dark:bg-[#202020] text-notion-text dark:text-notion-dark-text shadow-2xl rounded-lg border border-notion-border dark:border-[#303030] w-64 overflow-hidden flex flex-col text-sm"
                    style={style}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-2 border-b border-notion-border dark:border-[#303030]">
                        <button onClick={() => setShowRemindMenu(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft size={16}/></button>
                        <span className="font-medium">Remind</span>
                        <div className="w-6"></div>
                    </div>
                    <div className="py-1">
                        {[
                            'None',
                            'On day of event (9:00 AM)',
                            '1 day before (9:00 AM)',
                            '2 days before (9:00 AM)',
                            '1 week before (9:00 AM)'
                        ].map(opt => (
                            <div 
                                key={opt}
                                className="px-3 py-1.5 hover:bg-notion-hover dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                                onClick={() => handleRemindSelect(opt)}
                            >
                                <span>{opt}</span>
                                {remindOption === opt && <Check size={14} className="text-notion-blue" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div 
                className="absolute bg-white dark:bg-[#202020] text-notion-text dark:text-notion-dark-text shadow-2xl rounded-lg border border-notion-border dark:border-[#303030] w-[280px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
                style={style}
                onClick={e => e.stopPropagation()}
            >
                {/* Input Preview */}
                <div className="p-3 border-b border-notion-border dark:border-[#303030]">
                    <div className="w-full bg-gray-100 dark:bg-[#191919] border border-transparent focus-within:border-notion-blue rounded px-2 py-1 text-sm flex items-center">
                        <input 
                            className="bg-transparent outline-none w-full"
                            value={currentDate.toLocaleDateString()} 
                            readOnly 
                        />
                    </div>
                </div>

                {/* Calendar Header */}
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium">{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                    <div className="flex space-x-1">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft size={14} /></button>
                        <button onClick={() => setViewDate(new Date())} className="px-2 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-notion-dim">Today</button>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight size={14} /></button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="px-3 pb-3">
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => <div key={d} className="text-center text-xs text-notion-dim font-medium h-6 flex items-center justify-center">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1">
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Options */}
                <div className="border-t border-notion-border dark:border-[#303030] p-1 text-sm">
                    <div className="flex items-center justify-between px-3 py-1.5 hover:bg-notion-hover dark:hover:bg-gray-700 rounded cursor-pointer">
                        <span className="text-notion-dim">End date</span>
                        <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5"></div></div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 hover:bg-notion-hover dark:hover:bg-gray-700 rounded cursor-pointer">
                        <span className="text-notion-dim">Date format</span>
                        <span className="text-xs text-notion-dim">Month/Day/Year</span>
                    </div>
                    <div 
                        className="flex items-center justify-between px-3 py-1.5 hover:bg-notion-hover dark:hover:bg-gray-700 rounded cursor-pointer"
                        onClick={() => setIncludeTime(!includeTime)}
                    >
                        <span className="text-notion-dim">Include time</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${includeTime ? 'bg-notion-blue' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${includeTime ? 'left-4.5' : 'left-0.5'}`} style={{ left: includeTime ? '18px' : '2px' }}></div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-notion-border dark:border-[#303030] p-1 text-sm">
                     <div 
                        className="flex items-center justify-between px-3 py-1.5 hover:bg-notion-hover dark:hover:bg-gray-700 rounded cursor-pointer group"
                        onClick={() => setShowRemindMenu(true)}
                     >
                        <span className="text-notion-dim group-hover:text-notion-text dark:group-hover:text-notion-dark-text">Remind</span>
                        <div className="flex items-center text-notion-dim group-hover:text-notion-text dark:group-hover:text-notion-dark-text">
                            <span className="mr-1">{remindOption}</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>

                 <div className="border-t border-notion-border dark:border-[#303030] p-2 flex justify-between items-center text-xs">
                    <button onClick={() => { onSave('', 'None'); onClose(); }} className="text-notion-dim hover:text-notion-text">Clear</button>
                    <button onClick={handleSave} className="bg-notion-blue text-white px-3 py-1 rounded hover:bg-opacity-90">Done</button>
                 </div>
                 
                 <div className="border-t border-notion-border dark:border-[#303030] p-2 bg-gray-50 dark:bg-[#191919] text-xs text-notion-dim flex items-center justify-center">
                    <HelpCircle size={12} className="mr-1" /> Learn about reminders
                 </div>
            </div>
        </div>
    );
};

export default DatePicker;
