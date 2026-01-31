
"use client"
import React from 'react'
import { useState } from 'react';

import { FileUpload } from '@/components/ui/file-upload'
const ResumeUpload = ({setFiles}) => {
    //const [files, setFiles] = useState([]);

const handleFileUpload = (files) => {
  setFiles(files[0]);

};
  return (
  
       <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800  rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  
  )
}

export default ResumeUpload
