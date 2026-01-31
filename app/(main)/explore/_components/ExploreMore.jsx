import Image from 'next/image'
import React from 'react'


const ExploreMoreOptions=[
    {
        id:1,
        title:"Quizz Pack",
        desc:"practice what you learned with bite-sized code changlelege",
        icon:"/tree.png"
    },
    {
        id:2,
        titke:"Video Courses",
        desc:"Learn with Structured video lessons taught step-by-step",
        icon:"/game.png"
    },
    {
        id:3,
        title:"Community Project",
        desc:"Buld real-world apps by collaborting with the community",
        icon:"/growth.png"
    },
    {
        id:4,
        title:"Explore Apps",
        desc:"Explore prebuild app which c=you can try demo and build it",
        icon:"/start-up.png"
    }
]

const ExploreMore = () => {
  return (
    <div className="mt-8">
        <h2 className="text-3xl mb-2 font-game">
            Explore More
        </h2>
    <div className="grid grid-cols-2 gap-5">
       { ExploreMoreOptions.map((option,index)=>(
            <div className="flex gap-2 p-2 border rounded-xl bg-zinc-900"key={index}>
                <Image src={option?.icon} 
                alt={option?.title} width={80}
                height={80}/>
                <div>
                    <h2 className="font-medium text-2xl">{option?.title}</h2>
                    <p className="text-gray-400">{option?.desc}</p>
                </div>
        
    </div>
      ))}
    </div>
    </div>
  )
}

export default ExploreMore