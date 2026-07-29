'use client';

import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import ProblemPanel from './ProblemPanel';

// Mock data for initial scaffolding
const MOCK_PROBLEM = {
  title: 'Two Sum',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
  difficulty: 'easy' as const,
  conceptTag: 'arrays'
};

export default function Workspace() {
  const [code, setCode] = useState<string>('class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleRunCode = async () => {
    setIsExecuting(true);
    // TODO: Connect to backend Judge0 API
    setTimeout(() => {
      setIsExecuting(false);
      setAttempts(prev => prev + 1);
      alert('Mock execution completed. Backend API integration pending.');
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      {/* Left Panel: Problem Description */}
      <div className="w-1/2 h-full">
        <ProblemPanel 
          problem={MOCK_PROBLEM}
          hintText={hintVisible ? "Try using a HashMap to store the numbers you've seen so far and their indices. For each number x, you can check if (target - x) is already in the map." : null}
          onShowHint={() => setHintVisible(true)}
          showHintButton={attempts >= 2}
        />
      </div>

      {/* Right Panel: Code Editor */}
      <div className="w-1/2 h-full">
        <CodeEditor 
          language="java"
          code={code}
          onChange={(val) => setCode(val || '')}
          onRun={handleRunCode}
          isExecuting={isExecuting}
        />
      </div>
    </div>
  );
}
