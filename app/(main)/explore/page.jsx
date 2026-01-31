import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'

import EnrolledCourses from './_components/EnrolledCourses'
import ExploreMore from './_components/ExploreMore'
import InviteFriend from './_components/InviteFriend'
import UserStatus from './_components/UserStatus'
const page = () => {
  return (
    <div className="mt-15">
        
            <div className="grid grid-cols-3 gap-7">
                <div className="col-span-2">
                    <WelcomeBanner/>
                     <EnrolledCourses/>
                     <ExploreMore/>
                     <InviteFriend/>
                
                 </div>
              <div>
                <UserStatus/>
                </div>
        </div>
    </div>
  )
}

export default page