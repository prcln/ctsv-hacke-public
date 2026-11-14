import { useState, type ReactNode } from 'react'

interface AccordionProps {
	tabName: string;
	point?: number;
	maxPoint?: number;
	children: ReactNode;
}

export default function Accordion({ tabName, children, point, maxPoint }: AccordionProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			{/* 1.The Clickable Header*/}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={"w-full flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors"}
			>
				<span className="font-bold text-gray-800">{tabName}</span>
				
				{point ? (
				<span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
					{point} / {maxPoint} pts
				</span>) : <div></div>}

				{/* The arrow that rotates based on state! */}
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
			</button>

			{/* 2. The Expanding Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-320 opacity-100 p-4' : 'max-h-0 opacity-0 px-4 py-0'
        }`}
      >
				{children}
      </div>
		</div>
	)
}