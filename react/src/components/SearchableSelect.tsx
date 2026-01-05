import { useState, useEffect, useRef } from 'react';

interface Option {
    id: string;
    name: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Search...",
    className = ""
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Set selected option when value changes
    useEffect(() => {
        const option = options.find(opt => opt.id === value);
        setSelectedOption(option || null);
        if (option) {
            setSearchTerm(option.name);
        }
    }, [value, options]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionSelect = (option: Option) => {
        setSelectedOption(option);
        setSearchTerm(option.name);
        onChange(option.id);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        setIsOpen(true);
        
        // Clear selection if search term doesn't match current selection
        if (selectedOption && !selectedOption.name.toLowerCase().includes(newSearchTerm.toLowerCase())) {
            onChange('');
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputClick = () => {
        setIsOpen(true);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-terminal-border bg-terminal-bg text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border placeholder:text-terminal-fgDim"
            />
            
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-terminal-bgLight border border-terminal-border rounded-sm max-h-60 overflow-auto">
                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-2 text-terminal-fgDim text-sm uppercase tracking-wider">
                            No options found
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => handleOptionSelect(option)}
                                className="px-3 py-2 hover:bg-terminal-bg cursor-pointer text-sm text-terminal-fg font-semibold uppercase tracking-wider transition-colors"
                            >
                                {option.name}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
} 