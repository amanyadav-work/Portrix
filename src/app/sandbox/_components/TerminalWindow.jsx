'use client';

import ScrollShadow from '@/components/ScrollShadow';
import { useEffect, useRef, useState } from 'react';
import stripAnsi from 'strip-ansi';

export default function TerminalWindow({ webcontainerInstance,logs }) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const inputRef = useRef(null);

  const runCommand = async (cmd) => {
    if (!webcontainerInstance || !cmd.trim()) return;

    const [bin, ...args] = cmd.split(' ');
    const process = await webcontainerInstance.spawn(bin, args);

    setOutput(prev => prev + `\n$ ${cmd}\n`);

    const stream = new WritableStream({
      write(data) {
        const clean = stripAnsi(data);
        setOutput(prev => prev + clean);
      },
    });

    process.output.pipeTo(stream);
    await process.exit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await runCommand(command);
    setCommand('');
  };

  return (
    <div className="p-2 bg-black text-green-400 border-t border-gray-800 font-mono text-sm w-full">
      <ScrollShadow className="overflow-y-auto min-h-48 max-h-48 whitespace-pre-wrap bg-gray-900 p-2 rounded">
        {output||logs}
      </ScrollShadow>

      <form onSubmit={handleSubmit} className="flex mt-2">
        <span className="text-green-500 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-grow bg-black text-white outline-none"
          placeholder="Type a command..."
          autoFocus
        />
        <button type="submit" className="ml-2 bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">
          Run
        </button>
      </form>
    </div>
  );
}
