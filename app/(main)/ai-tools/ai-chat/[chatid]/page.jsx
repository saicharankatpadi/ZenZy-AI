
"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React ,{useEffect, useState}from 'react'
import EmptyState from '../_components/EmptyState'
import axios from 'axios'
import { LoaderCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'next/navigation'

const AiChat = () => {
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messageList,setMesageList] = useState([]);
    const {chatid} = useParams();
    const onSend = async () => {
        // Handle send action
        setLoading(true);
        setMesageList((prev)=>[...prev,{
            content: userInput,
            role: "user",
            type:"text"

        }]);
        setUserInput("");
        const result = await axios.post('/api/ai-career-chat', {userInput: userInput });
        console.log(result.data);
        setMesageList((prev)=>[...prev,result.data]);
        setLoading(false);
    };

    console.log(messageList);
    useEffect(() => {
        // Scroll to bottom when messageList changes
    },[messageList])
 
 
  return (
    <div className="px-10 md:px-24 lg:px-36 xl:px-48 ">
        <div className="flex items-center justify-between gap-8 mt-15">
            <div>
                <h2 className="font-bold text-lg">AI Career Q/A Chat</h2>
                <p> Smarter career decisions start here-get tailored advice,real time market insights</p>
            </div>
            <Button>+ New Chat</Button>
        </div>
        <div className="flex flex-col h-[75vh]">
          {messageList?.length<=0&& <div className="mt-5">
               <EmptyState selectedQuestion={(question)=>setUserInput(question)}/>
            </div>
}

            <div className="flex-1">
             {messageList?.map((message, index) => (
                <div>
                <div key={index} className={`flex mb-2 ${message.role=="user"?"justify-end":"justify-start"}`}>
                    <div className={`p-3 rounded-lg gap-2 ${message.role=="user"? "bg-transparent border-blue-500/40 text-white" 
                                : "bg-transparent border-white/80 text-white"
                    }`}>
                        <ReactMarkdown className="prose prose-invert text-base leading-relaxed">
                             {message.content} 
                        </ReactMarkdown>
                      
                      
                    </div>
                </div>
                      {loading&&messageList?.length-1 == index && <div className="flex justify-start p-3 rounded-lg gap-2 bg-gray-50 text-black mb-2">
                     <LoaderCircle className="animate-spin"/>Thinking....
                    </div>}
                    </div>
             ))}
            </div>
            <div className="flex justify-between items-center gap-6 shadow-sm   [w-90%] ">
                <Input placeholder="type" value={userInput} onChange={(e) => setUserInput(e.target.value)}/>
                <Button onClick={onSend} disabled={loading}>Send</Button>
            </div>
        </div>
    </div>
  )
}

export default AiChat;