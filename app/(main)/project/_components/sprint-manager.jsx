"use client"

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useFetch } from '@/hooks/use-fetch'
import { updateSprintStatus } from '@/actions/sprint'
import { BarLoader } from 'react-spinners'

const SprintManager = ({sprint, setSprint, sprints, projectId}) => {
    const [status, setStatus] = useState(sprint.status)
    
    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)
    const now = new Date()
    
    const canStart = isBefore(now, endDate) && isAfter(now, startDate) && status === "PLANNED"
    const canEnd = status === "ACTIVE"
    
    const {
      fn: updateStatus,
      loading,
      data: updatedStatus
    } = useFetch(updateSprintStatus)
    
    const handleStatusChange = async (newStatus) => {
      await updateStatus(sprint.id, newStatus)
    }
    
    useEffect(() => {
      if(updatedStatus && updatedStatus.success){
        setStatus(updatedStatus.sprint.status)
        setSprint((prevSprint) => ({
          ...prevSprint,
          status: updatedStatus.sprint.status
        }))
      }
    }, [updatedStatus, setSprint]) // Removed loading and sprint from dependencies
    
    useEffect(() => {
      // Sync local status with sprint prop changes
      setStatus(sprint.status)
    }, [sprint.status])
    
    const handleSprintChange = (value) => {
      const selectedSprint = sprints.find((s) => s.id === value)
      if (selectedSprint) {
        setSprint(selectedSprint)
      }
    }
    
    const getStatusText = () => {
      if(status === "COMPLETED"){
        return `Sprint Ended`
      }
      if(status === "ACTIVE" && isAfter(now, endDate)){
        return `Overdue by ${formatDistanceToNow(endDate)}`
      }
      if(status === "PLANNED" && isBefore(now, startDate)){
        return `Starts in ${formatDistanceToNow(startDate)}`
      }
      return null
    }
    
    return (
        <>
          <div className='flex justify-between items-center gap-4'>
            <Select value={sprint.id} onValueChange={handleSprintChange}>
                <SelectTrigger className="bg-slate-950 self-start">
                    <SelectValue placeholder="Select Sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((s) => ( // Changed sprint to s to avoid naming conflict
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({format(new Date(s.startDate), "MMM d, yyyy")}) to{" "}
                      {format(new Date(s.endDate), "MMM d, yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
            
            {canStart && (
              <Button 
                className="bg-green-900 text-white" 
                onClick={() => handleStatusChange("ACTIVE")} 
                disabled={loading}
              >
                Start Sprint
              </Button>
            )}
            
            {canEnd && (
              <Button 
                variant="destructive" 
                onClick={() => handleStatusChange("COMPLETED")} 
                disabled={loading}
              >
                End Sprint
              </Button>
            )}
          </div>
          
          {loading && <BarLoader width={"100%"} className='mt-2' color='#36d7b7'/>}
          
          {getStatusText() && (
            <Badge variant="secondary" className="mt-3 ml-1 self-start">
              {getStatusText()}
            </Badge>
          )}
        </>
    )
}

export default SprintManager