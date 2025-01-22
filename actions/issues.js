"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { issue } from "@uiw/react-md-editor";
import { id } from "date-fns/locale";


export async function createIssue(projectId, data){
    const {userId, orgId} = auth();

    if(!userId || !orgId){
        throw new Error("Unauthorized")
    }

    let user = await db.user.findUnique({where: {clerkUserId: userId}})


    const lastIssue = await db.issue.findFirst({
        where:{projectId, status: data.status},
        orderBy: {order: "desc"}
    })

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

    const issue = await db.issue.create({
        data:{
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            projectId: projectId,
            sprintId: data.sprintId,
            reporterId: user.id,
            assigneeId: data.assigneeId || null,
            order: newOrder,
        },
        include: {
            assignee: true,
            reporter: true
        }
    })
    return issue;
}

export async function getIssuesForSprint(sprintId){
    const {userId, orgId} = auth()
    if(!userId || !orgId){
        throw new Error("Unautorized")
    }
    const issues = await db.issue.findMany({
        where: {sprintId},
        orderBy:[{status:"asc"}, {order:"asc"}],
        include: {
            assignee: true,
            reporter: true
        }
    })
    return issues;
}

export async function updateIssueOrder(updatedIssues){
    const {userId, orgId} = auth();

    if(!userId || !orgId){
        throw new Error("Unauthorized")
    }

    await db.$transaction(async (prisma) => {
            for(const issue of updatedIssues){
                await prisma.issue.update({
                    where: {id: issue.id},
                    data :{
                        status: issue.status,
                        order: issue.order
                    }
                })
            }
    })
    return {success: true}
}

export async function deleteIssue(issueId){
    const { userId, orgId } = auth()

    if(!userId || !orgId){
        throw new Error("Unauthorized")
    }

    const user = await db.user.findUnique({

        where: {clerkUserId: userId}
    })

    if(!user){
        throw new Error("User not found")

    }

    const issue = await db.user.findUnique({
        where:{id: issueId},
        include: {project: true}
    })

    if(!issue){
        throw new Error("Issue not Found")
    }

    if(issue.reporterId !== user.id && !issue.project.adminIds.include(user.id)){
        throw new Error("You don't have the permission to delete this issue")
    }

    await db.issue.delete({where: {id:issueId}})

    return {success:true}
}

export async function updateIssue(issueId, data){
    const {userId, orgId} = auth()

    if(!userId || !orgId){
        throw new Error("Unauthorized")
    }

    try {
        const issue = await db.issue.findUnique({
            where:{id:issueId},
            include:{project: true}
        })

        if(!issue){
            throw new Error("Issue not Found")
        }
        if(issue.project.organizationId !== orgId){
            throw new Error("Unauthorized")
        }

        const updatedIssue = await db.issue.update({
            where: {id:issueId},
            data: {
                status: data.status,
                priority: data.priority
            },
            include:{
                assignee: true,
                reporter: true
            }

          
        })

        return updatedIssue
    } catch (error) {
        throw new Error(error.message)
    }
}