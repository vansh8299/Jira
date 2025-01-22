import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const IssueDetailsDialog = ({
    isOpen,
    onClose,
    issue,
    onDelete = () =>{},
    onUpdate = () => {},
    borderCol = ""

}) => {
  return (
   <Dialog isOpen={isOpen} onOpenChange={onClose}>
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>{issue.title}</DialogTitle>
        </DialogHeader>
    </DialogContent>
   </Dialog>
  )
}

export default IssueDetailsDialog