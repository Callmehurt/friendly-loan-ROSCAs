import { db } from "../utils/db.server";
import {CreateGroupAndEnrollSelfResult, GroupMember, SavingGroup, User } from "../utils/types";


export class SavingGroupService{

    create = async (data: SavingGroup): Promise <CreateGroupAndEnrollSelfResult> => {

        const {id, name, description, userId} = data;

        return await db.$transaction( async (tx) => {
            const newGroup = await tx.savingGroup.create({
                data: {
                    id,
                    name,
                    description,
                    userId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            uniqueIdentity: true,
                            fullname: true,
                            address: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            });

            const newMember = await tx.groupMembers.create({
                data: {
                    userId: userId,
                    groupId: newGroup.id,
                    addedBy: userId
                },
                include: {
                    user: true,
                    group: true,
                    addedByUser: true
                }
            });

            return {newGroup, newMember};
        })
    }

    findUserInGroup = async (userId: number, groupId: string): Promise <GroupMember | null> => {
        return await db.groupMembers.findFirst({
            where: {
                userId: userId,
                groupId: groupId
            }
        });
    }

    enrollMember = async (userId: any, groupId: string, addedBy: number): Promise <GroupMember | null > => {

        return await db.$transaction( async (tx) => {
            return await tx.groupMembers.create({
                data: {
                    userId: userId,
                    groupId: groupId,
                    addedBy: addedBy
                },
                include: {
                    user: true,
                    group: true,
                    addedByUser: true
                }
            });
        })
    }
}