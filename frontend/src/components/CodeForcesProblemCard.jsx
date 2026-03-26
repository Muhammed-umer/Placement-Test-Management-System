import { ExternalLink, Code2, Zap, BookOpen, TestTubes } from 'lucide-react';

export default function CodeForcesProblemCard({ problem, index, onUpdate, onRemove }) {
  return (
    <div className="glass-panel p-6 rounded-2xl relative border-l-4 border-l-[#FF6B6B] shadow-xl bg-gradient-to-br from-[#FFFFFF] to-[#FFE5E5]/30">
      {/* Remove Button */}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 text-[#2C3E50] hover:text-rose-500 transition-colors bg-[#FFFFFF]/50 p-2 rounded-lg hover:bg-rose-100"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-12">
        <div className="flex items-center gap-4">
          <span className="bg-[#FF6B6B]/20 text-[#FF6B6B] w-10 h-10 rounded-lg flex items-center justify-center text-sm border border-[#FF6B6B]/30 font-black">
            Q{index + 1}
          </span>
          <div>
            <h3 className="text-xl font-black text-[#2C3E50]">{problem.title || 'CodeForces Problem'}</h3>
            <p className="text-sm text-[#2C3E50]/60 flex items-center gap-2 mt-1">
              <Zap size={14} /> Rating: {problem.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#FF6B6B]/10 px-3 py-1 rounded-lg border border-[#FF6B6B]/30">
          <Code2 size={16} className="text-[#FF6B6B]" />
          <span className="text-sm font-bold text-[#FF6B6B]">CODING</span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-[#FFFFFF]/60 p-4 rounded-xl mb-6 border border-[#FF6B6B]/20">
        <p className="text-[#2C3E50]/80 text-sm leading-relaxed whitespace-pre-wrap">
          {problem.description}
        </p>
      </div>

      {/* Problem Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Input Format */}
        <div className="bg-[#FFFFFF]/40 p-4 rounded-xl border border-[#4CAF50]/20">
          <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen size={14} /> Input Format
          </label>
          <div className="text-sm text-[#2C3E50]/80 font-mono bg-[#F4F4F4] p-3 rounded-lg">
            {problem.inputFormat}
          </div>
        </div>

        {/* Output Format */}
        <div className="bg-[#FFFFFF]/40 p-4 rounded-xl border border-[#4CAF50]/20">
          <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen size={14} /> Output Format
          </label>
          <div className="text-sm text-[#2C3E50]/80 font-mono bg-[#F4F4F4] p-3 rounded-lg">
            {problem.outputFormat}
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div className="bg-[#FFFFFF]/40 p-4 rounded-xl border border-[#4CAF50]/20 mb-6">
        <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider mb-2 block">
          Constraints
        </label>
        <div className="text-sm text-[#2C3E50]/80 font-mono bg-[#F4F4F4] p-3 rounded-lg space-y-1">
          {problem.constraints && problem.constraints.split(';').map((constraint, idx) => (
            <div key={idx} className="text-[#2C3E50]/85">
              {constraint.trim()}
            </div>
          ))}
        </div>
      </div>

      {/* Test Cases Section */}
      <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFE5E5]/20 p-5 rounded-xl border-2 border-dashed border-[#FF6B6B]/30 mb-6">
        <label className="text-sm font-black text-[#FF6B6B] uppercase tracking-wider mb-3 flex items-center gap-2">
          <TestTubes size={16} /> Test Cases Available
        </label>
        {problem.testCases && problem.testCases.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#2C3E50]/70 mb-1">
              {problem.testCases.length} sample test case{problem.testCases.length > 1 ? 's' : ''}
            </div>
            {problem.testCases.map((tc, idx) => (
              <div key={idx} className="bg-[#FFFFFF] p-4 rounded-lg border border-[#FF6B6B]/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#FF6B6B] uppercase mb-2">
                      {tc.isSample ? '✓ Sample Test Case' : `Test Case ${idx}`}
                    </p>
                    <div className="bg-[#F4F4F4] p-2 rounded text-xs font-mono text-[#2C3E50]">
                      <p className="text-blue-600 font-bold">Input:</p>
                      <p className="truncate">{tc.input}</p>
                      <p className="text-green-600 font-bold mt-1">Expected Output:</p>
                      <p className="truncate">{tc.expectedOutput}</p>
                    </div>
                  </div>
                  {tc.testCaseUrl && (
                    <a
                      href={tc.testCaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 bg-[#FF6B6B] text-white px-3 py-2 rounded-lg hover:bg-[#FF5252] transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      View <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#2C3E50]/60 italic">
            No sample test cases displayed. Click the CodeForces link to view all test cases and problem details.
          </p>
        )}
      </div>

      {/* CodeForces Link Button */}
      {problem.codeforces_link && (
        <div className="flex gap-3">
          <a
            href={problem.codeforces_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white px-6 py-3 rounded-xl font-black hover:shadow-lg hover:shadow-[#FF6B6B]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
          >
            <ExternalLink size={18} /> Open on CodeForces
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(problem.codeforces_link)}
            className="bg-[#FFFFFF] text-[#FF6B6B] border-2 border-[#FF6B6B] px-4 py-3 rounded-xl font-black hover:bg-[#FFE5E5] transition-colors"
            title="Copy link to clipboard"
          >
            📋
          </button>
        </div>
      )}

      {/* Points */}
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#FF6B6B]/20">
        <span className="text-xs font-bold text-[#2C3E50] uppercase">Points Value</span>
        <input
          type="number"
          value={problem.points || 50}
          onChange={(e) => onUpdate(index, 'points', e.target.value)}
          className="bg-[#FFFFFF] border-2 border-[#FF6B6B] text-[#FF6B6B] font-black rounded-lg px-3 py-1 w-16 text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30"
        />
      </div>
    </div>
  );
}
