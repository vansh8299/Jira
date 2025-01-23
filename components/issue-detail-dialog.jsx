"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useFetch } from "@/hooks/use-fetch";
import { deleteIssue, updateIssue } from "@/actions/issues";
import { BarLoader } from "react-spinners";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import statuses from "@/data/status";
import MDEditor from "@uiw/react-md-editor";
import UserAvatar from "./user-avatar";
const IssueDetailsDialog = ({
  isOpen,
  onClose,
  issue,
  onDelete = () => {},
  onUpdate = () => {},
  borderCol = "",
}) => {
    const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const [status, setStatus] = useState();
  const [priority, setPriority] = useState();

  const { user } = useUser();
  const { membership } = useOrganization();

  const pathname = usePathname();
  const router = useRouter();

  const {
    loading: deleteLoading,
    error: deleteError,
    fn: deleteIssueFn,
    data: deleted,
  } = useFetch(deleteIssue);

  const {
    loading: updateLoading,
    error: updateError,
    fn: updateIssueFn,
    data: updated,
  } = useFetch(updateIssue);


  const handleStatusChange = async(newStatus) => {
    setStatus(newStatus)
    updateIssueFn(issue.id, {status: newStatus, priority})

  }

  const handlePriorityChange = async(newPriority) => {
    setPriority(newPriority)
    updateIssueFn(issue.id, { status, priority:newPriority})

  }

  const handleDelete = () =>{
    if(window.confirm("Are you sure want to delete this issue?")){
        deleteIssueFn(issue.id)
    }
  }

  useEffect(() => {
    if(deleted){
        onClose()
        onDelete()
    }
    if(updated){
        onUpdate(updated)
    }
  }, [deleted, updated, deleteLoading, updateLoading])
  const canChange =
    user.id === issue.reporter.clerkUserId || membership.role === "org:admin";

  const isProjectPage = pathname.startsWith("/project/");

  const handleGoToProject = () => {
    router.push(`/project/${issue.projectId}?sprint=${issue.sprintId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl">{issue.title}</DialogTitle>

            {!isProjectPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoToProject}
                title="Go To Project"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        {(updateLoading || deleteLoading) && (
            <BarLoader width={"100%"} color="#36d7b7" />
        )}
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status" />
                        
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map((option) => (
                            <SelectItem key={option.key} value={option.key}>{option.name}</SelectItem>

                        ))}
                    </SelectContent>
                </Select>
                <Select value={priority} onValueChange={handlePriorityChange} disabled={!canChange}>
                    <SelectTrigger className={`border ${borderCol} rounded`}>
                        <SelectValue placeholder="Priority" />
                        
                    </SelectTrigger>
                    <SelectContent>
                        {priorityOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>

                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <h4 className="font-semibold">Description</h4>
                <MDEditor.Markdown
                  className="rounded px-2 py-1"
                  source={issue.description ? issue.description : "--"}
                  />
            </div>
            <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                   <h4 className="font-semibold">Assignee</h4>
                   <UserAvatar user={issue.assignee} />
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold">Reporter</h4>
                    <UserAvatar user={issue.reporter} />
                </div>
            </div>
            {canChange && (
                <Button
                variant="destructive"
                disabled={deleteLoading}
                onClick={handleDelete}
                >{deleteLoading ? "Deleting..." : "Delete Issue"}</Button>
            )}
            {(deleteError || updateError) && (
                <p className="text-red-500">{deleteError?.message || updateError?.message}</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsDialog;
