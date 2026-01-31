import { Button } from '@/components/ui/button'
import React from 'react'

const CommunityHelpSection = () => {
  return (
    <div className="font-bold p-4 border-4 mt-7 flex items-center rounded-xl gap-4">
<h2 className="text-3xl">NeedHelp?</h2>
<p>Ask question in our community</p>
<Button className="text-2xl mt-3" variant={"pixel"} size={"sm"}>Go to Community</Button>

        </div>
  )
}

export default CommunityHelpSection