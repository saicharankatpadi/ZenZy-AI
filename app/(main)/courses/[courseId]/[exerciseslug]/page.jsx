
"use client"
import React from 'react'
import SplitterLayout from 'react-splitter-layout'
import "react-splitter-layout/lib/index.css"


const page = () => {
  return (
    <div classname="border-t-4">
        <SplitterLayout percentage 
        primaryMinSize={40}

        secondaryInitialSize={60}>
            <div>Content</div>
            <div>Code Editor</div>
        </SplitterLayout>





    </div>
  )
}

export default page