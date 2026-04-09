import { Sparkles, Send } from 'lucide-react';

export default function AiSearchBar() {
  return (
    <div className="bg-white border border-[#006fcf] border-solid flex items-center justify-between overflow-clip p-[16px] rounded-[10px] w-full h-[56px]">
      <Sparkles size={28} className="shrink-0 text-[#006fcf]" />

      <input
        type="text"
        placeholder="Ask your AI Assistant"
        className="flex-1 bg-transparent border-0 outline-none pl-[24px] text-[14px] text-[#b3b3b3] placeholder-[#b3b3b3]"
      />

      <div className="bg-[#b3b3b3] h-[26px] w-px mx-[12px]" />

      <Send size={28} className="shrink-0 cursor-pointer text-[#006fcf] hover:text-[#004999]" />
    </div>
  );
}
