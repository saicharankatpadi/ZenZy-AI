import React from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const InviteFriend = () => {
  return (
    <div className="flex flex-col items-center mt-8 p-4 border rounded-xl bg-zinc-900">
        <Image src={"/mail.png"} alt="mail"

        width={80}  height={80}/>
        <h2 className="text-3xl">Invite Friend</h2>
        <p className="text-2xl">Having Fun ? Share the love with a friend ! Enter an email and we will send them a personal invite</p>
       <div className="flex gap-2 items-center mt-5">
        <Input placeholder="Enter Invitee Email" className="min-w-sm"/>
        <Button variant={"pixel"} className="text-2xl">Invite</Button>
       </div>
    
    </div>

  )
}

export default InviteFriend