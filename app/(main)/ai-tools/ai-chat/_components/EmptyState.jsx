import React from 'react'

const questionList =[
    "What skills do I need for a data analyst role?",
    "How do I switch careers to UX design?",
]

const EmptyState = ({selectedQuestion}) => {
  return (
    <div>
        <h2 className="font-bold text-xl text-center">Ask a question to get started</h2>
        <div className="mt-4">
            {questionList.map((question, index) => (
                <h2 key={index} className="p-4 text-center border rounded-lg my-3 hover:border-primary cursor-pointer"
                 onClick={()=>selectedQuestion(question)}
                >{question}</h2>
            ))}
        </div>
    </div>
  )
}

export default EmptyState